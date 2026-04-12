# 05 — Authentication & RBAC (ระบบยืนยันตัวตนและสิทธิ์)

เอกสารนี้อธิบายระบบ Authentication และ Role-Based Access Control (RBAC) ของ Admin Panel อย่างละเอียด

---

## ภาพรวม

Admin Panel ใช้ **JWT (JSON Web Token)** สำหรับ Authentication และแบ่งสิทธิ์ผู้ใช้เป็น 3 ระดับ (Role) โดยทั้ง Frontend และ Backend ทำงานร่วมกันในการควบคุมสิทธิ์

```
┌─────────────────────────────────────────────────────────┐
│                     Role Hierarchy                       │
│                                                         │
│   admin ──────────► เข้าได้ทุกหน้า + จัดการ users          │
│     │                                                   │
│   user_account ──► เข้าได้ทุกหน้า ยกเว้น /users (editor)   │
│     │                                                   │
│   visitor ───────► เข้าได้เฉพาะ / และ /contacts (อ่านเท่านั้น)│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Roles (บทบาทผู้ใช้)

### 1. `admin` — ผู้ดูแลระบบ

| สิทธิ์ | รายละเอียด |
|--------|-----------|
| เข้าถึง | ทุกหน้าในระบบ |
| จัดการเนื้อหา | CRUD skills, projects, experiences, etc. |
| จัดการ users | สร้าง, แก้ไข, ลบ, เปลี่ยน password, เปลี่ยน role |
| ลบข้อความ | ลบ contact messages ได้ |
| ดู Dashboard | เห็นสถิติทั้งหมด + quick actions |

### 2. `user_account` (Editor) — ผู้แก้ไขเนื้อหา

| สิทธิ์ | รายละเอียด |
|--------|-----------|
| เข้าถึง | ทุกหน้า **ยกเว้น** `/users` |
| จัดการเนื้อหา | CRUD skills, projects, experiences, etc. |
| จัดการ users | **ไม่ได้** |
| ลบข้อความ | ลบ contact messages ได้ |
| ดู Dashboard | เห็นสถิติทั้งหมด + quick actions |

### 3. `visitor` — ผู้เยี่ยมชม

| สิทธิ์ | รายละเอียด |
|--------|-----------|
| เข้าถึง | เฉพาะ `/` (Dashboard) และ `/contacts` |
| จัดการเนื้อหา | **ไม่ได้** (read-only) |
| จัดการ users | **ไม่ได้** |
| ลบข้อความ | **ไม่ได้** |
| ดู Dashboard | เห็นเฉพาะสถิติ messages |

---

## Authentication Flow

### Login ปกติ

```
1. ผู้ใช้กรอก username + password ที่หน้า /login
                │
                ▼
2. useAuth().login() ส่ง POST /api/v1/admin/auth/login
                │
                ▼
3. Backend ตรวจสอบ credentials
   ├── ถูกต้อง → ส่ง JWT token กลับมา
   │             │
   │             ▼
   │   4. เก็บ token ลง:
   │      - useState('auth_token') — reactive state
   │      - localStorage('admin_token') — persist ข้าม reload
   │             │
   │             ▼
   │   5. Decode JWT เพื่อดึง role และ user ID
   │      - useState('user_role')
   │      - useState('current_user_id')
   │             │
   │             ▼
   │   6. navigateTo('/') → เข้า Dashboard
   │
   └── ผิดพลาด → แสดง error message ที่หน้า login
```

### Demo Mode (Mock Login)

```
1. ผู้ใช้กด "Demo Mode" ที่หน้า /login
                │
                ▼
2. useAuth().loginDemo()
   - สร้าง fake JWT token
   - ตั้ง role = 'admin'
   - ตั้ง mock_mode = true
   - เก็บลง localStorage
                │
                ▼
3. ทุก API call จะ short-circuit ไปใช้ useMockData()
   (ไม่ยิง HTTP request จริง)
                │
                ▼
4. navigateTo('/') → เข้า Dashboard (Demo)
```

### Logout

```
1. ผู้ใช้กดปุ่ม Logout ที่ sidebar
                │
                ▼
2. useAuth().logout()
   - ล้าง auth_token (useState + localStorage)
   - ล้าง mock_mode
   - ล้าง user_role
   - ล้าง current_user_id
                │
                ▼
3. navigateTo('/login')
```

### Token Recovery (เปิดหน้าใหม่ / refresh)

```
1. Page load → useAuth() ทำงาน
                │
                ▼
2. อ่าน token จาก localStorage('admin_token')
                │
        ┌───────┴───────┐
        │ มี token      │ ไม่มี token
        ▼               ▼
   Decode JWT      auth.global.ts
   ตั้ง role/id    redirect → /login
   ใช้งานต่อได้
```

---

## JWT Token Structure

### Payload ที่ Backend สร้าง

```json
{
  "sub": "64a1b2c3d4e5f6789012abcd",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700086400
}
```

| Claim | คำอธิบาย |
|-------|---------|
| `sub` | User ID (MongoDB ObjectID) |
| `role` | บทบาทของผู้ใช้: `admin`, `user_account`, `visitor` |
| `iat` | เวลาที่สร้าง token |
| `exp` | เวลาที่ token หมดอายุ |

### การ Decode ใน Frontend

`useAuth.ts` decode JWT payload ด้วย `atob()` + `JSON.parse()` (ไม่ verify signature ฝั่ง client เพราะ signature verification ทำที่ Backend)

---

## Route Guard (Middleware)

### `middleware/auth.global.ts`

Middleware นี้ทำงาน**ทุกครั้ง**ที่มีการ navigate ไปหน้าใดๆ

```
┌─────────────────────────────────────────────────────────┐
│               auth.global.ts Decision Tree               │
│                                                         │
│  Route = /login?                                        │
│  ├── Yes + authenticated → redirect /                   │
│  └── Yes + not authenticated → ✅ ผ่าน (แสดง login)      │
│                                                         │
│  Authenticated?                                         │
│  └── No → redirect /login                               │
│                                                         │
│  Route = /users?                                        │
│  └── Yes + role ≠ admin → redirect /                    │
│                                                         │
│  Role = visitor?                                        │
│  └── Yes + route ไม่ใช่ / หรือ /contacts → redirect /    │
│                                                         │
│  ✅ ผ่านทั้งหมด → แสดงหน้าตามปกติ                          │
└─────────────────────────────────────────────────────────┘
```

### Visitor Allowed Paths

```typescript
const VISITOR_ALLOWED_PATHS = ['/', '/contacts', '/login']
```

### Admin Only Paths

```typescript
const ADMIN_ONLY_PATHS = ['/users']
```

---

## Sidebar Navigation (UI-level RBAC)

Sidebar ใช้ `minRole` เพื่อกรอง link ที่แสดง:

| Link | Path | `minRole` | ใครเห็น |
|------|------|-----------|--------|
| Dashboard | `/` | `visitor` | ทุกคน |
| Site Settings | `/site-settings` | `user_account` | Editor, Admin |
| Hero | `/hero` | `user_account` | Editor, Admin |
| About | `/about` | `user_account` | Editor, Admin |
| Skills | `/skills` | `user_account` | Editor, Admin |
| Projects | `/projects` | `user_account` | Editor, Admin |
| Experiences | `/experiences` | `user_account` | Editor, Admin |
| Social Links | `/social-links` | `user_account` | Editor, Admin |
| Contacts | `/contacts` | `visitor` | ทุกคน |
| Users | `/users` | `admin` | Admin เท่านั้น |

### `hasRole()` Logic

```
Role Levels:
  visitor      = 0
  user_account = 1
  admin        = 2

hasRole(requiredRole):
  return currentRoleLevel >= requiredRoleLevel
```

---

## UI Indicators

### Read-Only Badge

- แสดงที่ `AdminHeader` เมื่อ role = `visitor` **และ** ไม่ใช่ mock mode
- บ่งบอกว่าผู้ใช้ดูได้อย่างเดียว ไม่สามารถแก้ไข

### Demo Mode Badge

- แสดงที่ `AdminHeader` เมื่อ `isMockMode = true`
- บ่งบอกว่ากำลังใช้ข้อมูล mock ไม่ใช่ข้อมูลจริง

### Role Badge

- แสดงที่ `AdminSidebar` ด้านล่าง
- แสดง role ปัจจุบัน (Admin / Editor / Visitor)

---

## Component-Level Access Control

บาง component ซ่อน/แสดงปุ่มตาม role:

| Component/Page | Action | ต้องการ role |
|---------------|--------|-------------|
| `contacts.vue` | ปุ่มลบข้อความ | `isEditor` (user_account+) |
| `users.vue` | ปุ่มลบ user | `isAdmin` + ไม่ใช่ตัวเอง |
| `users.vue` | เปลี่ยน role ตัวเอง | ไม่ได้ (disabled) |
| `index.vue` | Quick Actions | `isEditor` |
| `index.vue` | สถิติ Skills/Projects/Exp | `isEditor` |

---

## Backend RBAC (สิ่งที่ Backend ทำเพิ่ม)

Backend (Go) ตรวจสอบสิทธิ์เพิ่มเติมที่ API level:

1. **Verify JWT signature** — ทุก request (ยกเว้น login)
2. **Check token expiry** — token หมดอายุ → 401
3. **Check role permissions** — role ไม่มีสิทธิ์ → 403
4. **Validate ownership** — บาง operation ตรวจว่าเป็นเจ้าของ resource

> Frontend RBAC เป็นแค่ UX guard ที่ทำให้ผู้ใช้ไม่เห็นสิ่งที่ไม่ควรเข้าถึง  
> Backend RBAC เป็น security guard ที่ป้องกัน unauthorized access จริงๆ

---

## Security Considerations

| ข้อควรระวัง | สถานะ |
|------------|-------|
| JWT เก็บใน `localStorage` | ⚠️ เสี่ยง XSS (ถ้ามี XSS vulnerability) |
| Token ไม่ verify signature ฝั่ง client | ✅ ปกติ (Backend verify) |
| Demo token เป็น fake | ✅ ปลอดภัย (mock mode ไม่ยิง API) |
| 401 → auto logout | ✅ ดี (ป้องกันใช้ expired token) |
| Route guard เป็น client-side | ⚠️ ต้องพึ่ง Backend RBAC ด้วย |

### คำแนะนำสำหรับ Production

1. พิจารณาใช้ **httpOnly cookie** แทน localStorage สำหรับเก็บ JWT
2. ตั้ง **token expiry** ให้สั้น (เช่น 1-2 ชั่วโมง) พร้อม refresh token mechanism
3. ใช้ **HTTPS** เสมอใน production
4. ตรวจสอบว่า Backend มี **rate limiting** ที่ login endpoint
