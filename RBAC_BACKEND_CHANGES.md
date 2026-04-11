# RBAC Backend Changes (Admin_Website_Management)

รายละเอียดสิ่งที่แก้ไขแล้วในโปรเจกต์ Backend เพื่อรองรับระบบ RBAC 3 roles

## สรุป Roles

| Role | Level | สิทธิ์ |
|------|-------|--------|
| `admin` | 3 | ทำได้ทุกอย่าง + จัดการ user |
| `user_account` | 2 | แก้ไข content ทั้งหมด + ลบ messages, ไม่สามารถจัดการ user |
| `visitor` | 1 | อ่าน messages ได้อย่างเดียว |

## ไฟล์ที่แก้ไข

### 1. `internal/model/model.go`

- เพิ่ม `Role` และ `UpdatedAt` ใน `AdminUser` struct
- เพิ่ม role constants: `RoleAdmin`, `RoleUserAccount`, `RoleVisitor`
- เพิ่ม `ValidRoles` map + `RoleLevel()` function สำหรับเทียบ role hierarchy
- เพิ่ม request types: `CreateUserRequest`, `UpdateUserRequest`, `ChangePasswordRequest`
- แก้ `LoginResponse` ให้ return user info (id, username, role) พร้อม token

### 2. `internal/handler/auth.go`

- เพิ่ม `role` claim ใน JWT token
- แก้ `Login` ให้ return `LoginResponse` พร้อม `User` object (id, username, role)
- เพิ่ม `GetMe` handler (GET /api/v1/admin/auth/me) ดึงข้อมูล user ปัจจุบัน

### 3. `internal/middleware/middleware.go`

- เพิ่ม context keys: `UserIDKey`, `UsernameKey`, `RoleKey`
- แก้ `Auth` middleware ให้ parse JWT claims แล้วใส่ user_id, username, role เข้า context
- เพิ่ม `RequireRole(minRole, authMw)` middleware ตรวจสอบ role level
- เพิ่ม helper functions: `GetUserID()`, `GetUsername()`, `GetRole()`

### 4. `internal/repository/admin_user.go`

- เพิ่ม `EnsureIndexes()` สร้าง unique index บน username
- เพิ่ม `FindByID()`, `List()`, `Create()`, `Update()`, `UpdatePassword()`, `Delete()`
- เพิ่ม `CountByRole()` สำหรับป้องกันการลบ admin คนสุดท้าย

### 5. `internal/handler/user.go` (ไฟล์ใหม่)

Endpoints ทั้งหมด admin only:

| Method | Path | Handler | หมายเหตุ |
|--------|------|---------|----------|
| GET | /api/v1/admin/users | List | list ทุก user |
| POST | /api/v1/admin/users | Create | สร้าง user ใหม่ (validate: username, password >= 8 chars, valid role) |
| GET | /api/v1/admin/users/{id} | GetByID | ดู user ตาม ID |
| PUT | /api/v1/admin/users/{id} | Update | แก้ username + role (ห้ามลด role ตัวเอง, ห้ามลบ admin คนสุดท้าย) |
| DELETE | /api/v1/admin/users/{id} | Delete | ลบ user (ห้ามลบตัวเอง, ห้ามลบ admin คนสุดท้าย) |
| PUT | /api/v1/admin/users/{id}/password | ChangePassword | เปลี่ยนรหัสผ่าน (password >= 8 chars) |

### 6. `internal/router/router.go`

Route permissions:

| Middleware | Role ที่เข้าถึงได้ | Endpoints |
|------------|-------------------|-----------|
| `requireAdmin` | admin | User management, GET /auth/me |
| `requireUser` | admin, user_account | Content CRUD, File upload, Contact delete |
| `requireVisitor` | admin, user_account, visitor | GET contacts, GET /auth/me |

### 7. `internal/database/seed.go`

- Admin คนแรก seed ด้วย `Role: model.RoleAdmin`
- เพิ่ม `UpdatedAt` timestamp

## Migration สำหรับ Database เดิม

ถ้ามี admin_users ใน database อยู่แล้ว (ไม่มี field `role`) ต้องรัน migration:

```javascript
// MongoDB Shell
db.admin_users.updateMany(
  { role: { $exists: false } },
  { $set: { role: "admin", updated_at: new Date() } }
)
```

หรือรัน Docker:

```bash
docker compose exec mongo mongosh portfolio_admin --eval '
  db.admin_users.updateMany(
    { role: { $exists: false } },
    { $set: { role: "admin", updated_at: new Date() } }
  )
'
```

## API Request/Response Examples

### Login

```
POST /api/v1/admin/auth/login
Body: { "username": "admin", "password": "password" }
Response: {
  "data": {
    "token": "eyJ...",
    "user": { "id": "...", "username": "admin", "role": "admin" }
  }
}
```

### Create User

```
POST /api/v1/admin/users
Headers: Authorization: Bearer <token>
Body: { "username": "viewer", "password": "password123", "role": "visitor" }
Response: { "data": { "id": "...", "username": "viewer", "role": "visitor", ... } }
```

### Change Password

```
PUT /api/v1/admin/users/{id}/password
Headers: Authorization: Bearer <token>
Body: { "new_password": "newpassword123" }
Response: { "data": { "status": "password changed" } }
```
