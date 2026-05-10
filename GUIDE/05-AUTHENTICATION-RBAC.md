# 05 — Authentication & RBAC

เอกสารนี้อธิบายระบบ login และสิทธิ์ปัจจุบันของ Admin Dashboard หลังเปลี่ยนเป็น multi-site แล้ว

---

## Role Model ปัจจุบัน

ระบบใช้ role ระดับบัญชี 4 ระดับ:

| Role | สิทธิ์หลัก |
|------|------------|
| `super_admin` | เห็นทุก site, จัดการ site, จัดการ user ทุกคน, สร้าง `super_admin` คนอื่นได้ |
| `admin` | เห็นเฉพาะ site ที่ได้รับสิทธิ์, แก้ content, จัดการ user ภายใต้ site ที่ตัวเองมี access, แต่สร้าง `super_admin` ไม่ได้ |
| `editor` | เห็นเฉพาะ site ที่ได้รับสิทธิ์ และแก้ content ได้ แต่ไม่เห็น User Management |
| `viewer` | เห็นเฉพาะ site ที่ได้รับสิทธิ์ และเข้าได้เฉพาะ Dashboard/Contacts |

`site_members` เป็น access list ว่า user เข้าถึง site ไหนได้บ้าง ไม่ใช้ per-site role ใน UI แล้ว

---

## Authentication Flow

1. ผู้ใช้ login ที่ `/login`
2. `useAuth().login()` เรียก `POST /api/v1/admin/auth/login`
3. Backend ตรวจ username/password แล้วส่ง JWT กลับมา
4. Frontend เก็บ token ใน `useState('auth_token')` และ `localStorage('admin_token')`
5. Frontend decode JWT เพื่ออ่าน `role` และ `sub`
6. Logout จะล้าง token, role, selected site และ redirect ไป `/login`

JWT payload ที่ frontend ใช้:

```json
{
  "sub": "user_object_id",
  "usr": "admin",
  "role": "super_admin",
  "iat": 1700000000,
  "exp": 1700086400
}
```

Frontend decode JWT เพื่อทำ UX guard เท่านั้น ส่วน backend ต้อง verify JWT และ enforce permission จริงทุกครั้ง

---

## Route Guard

ไฟล์หลัก:

- `middleware/auth.global.ts`
- `config/permissions.ts`

กติกาปัจจุบัน:

| Path | ผู้เข้าได้ |
|------|------------|
| `/login` | unauthenticated เท่านั้น ถ้า login แล้วจะ redirect `/` |
| `/` | ทุก role ที่ login แล้ว |
| `/contacts` | ทุก role ที่ login แล้ว |
| content pages เช่น `/site-settings`, `/hero`, `/projects` | `editor+` |
| `/users` | `admin+` |
| `/sites` | `super_admin` เท่านั้น |

ถ้ายังไม่มี site เลย layout จะบล็อกหน้าส่วนใหญ่ไว้ แต่ `super_admin` ยังเข้า `/sites` ได้เพื่อสร้าง site แรก

---

## Sidebar

Sidebar ใช้ `config/navigation.ts` และ `hasRole(minRole)` เพื่อซ่อน/แสดงเมนู

- Portfolio menu แสดงตาม site type `portfolio` ที่ backend ส่งกลับมา
- Shop/Finance menu จะแสดงก็ต่อเมื่อ backend ส่ง site type `shop` หรือ `finance` กลับมาแล้ว
- `User Management` แสดงเฉพาะ `admin+`
- `Site Management` แสดงเฉพาะ `super_admin`

---

## User Management

หน้า `/users` ใช้สำหรับ `admin+`

- `super_admin` เห็นและจัดการ user ทุกคน
- `admin` จัดการ user ได้ภายใต้ site ที่ตัวเองมี access
- `admin` สร้าง `admin`, `editor`, `viewer` ได้ แต่สร้าง `super_admin` ไม่ได้
- `editor` และ `viewer` ไม่เห็นเมนู User Management
- ตอนสร้าง/แก้ user เลือก site access ด้วย checkbox

---

## Site Management

หน้า `/sites` ใช้สำหรับ `super_admin` เท่านั้น

ทำได้:

- สร้าง site ใหม่
- แก้ `name`, `slug`, `domains`
- ลบ site

เมื่อสร้าง site type `portfolio` backend จะ seed default portfolio content ให้ site นั้น เพื่อให้แก้ content ต่อได้ทันที

---

## Security Notes

- Frontend RBAC เป็น UX guard เท่านั้น
- Backend ต้อง enforce role และ site access จริงทุก endpoint
- JWT อยู่ใน `localStorage` จึงต้องระวัง XSS
- Production ควรใช้ HTTPS เสมอ
