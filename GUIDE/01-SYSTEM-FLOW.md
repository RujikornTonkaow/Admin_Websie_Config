# 01 — System Flow (ระบบการทำงาน)

เอกสารนี้อธิบาย flow การทำงานของ **Portfolio Admin Panel** ตั้งแต่ผู้ใช้เปิดเว็บจนถึงการบันทึกข้อมูลลง Backend

---

## ภาพรวมระบบ (System Overview)

โปรเจกต์นี้เป็น **Admin Panel** สำหรับจัดการเนื้อหาเว็บไซต์ Portfolio โดยแบ่งเป็น 3 ส่วนที่ทำงานร่วมกัน:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Portfolio Site     │     │   Admin Panel        │     │   Go Backend API    │
│   (Public Website)   │     │   (โปรเจกต์นี้)       │     │   (REST API)        │
│   Port: 3000         │     │   Port: 3001         │     │   Port: 8080        │
│                      │     │                      │     │                      │
│   แสดงผลเว็บไซต์       │◄────│   จัดการเนื้อหา       │────►│   จัดเก็บ/อ่านข้อมูล   │
│   Portfolio           │     │   ทุกส่วนของเว็บ      │     │   + Authentication  │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

- **Portfolio Site** (Port 3000) — เว็บไซต์ Portfolio ที่ผู้เข้าชมทั่วไปเห็น
- **Admin Panel / Website_Config** (Port 3001) — **โปรเจกต์นี้** ใช้จัดการเนื้อหาทุกส่วนของเว็บ
- **Go Backend API / Admin_Website_Management** (Port 8080) — REST API ที่รับ-ส่งข้อมูลและจัดการ Authentication

---

## Flow หลักของระบบ

### 1. Login Flow (การเข้าสู่ระบบ)

```
ผู้ใช้เปิด Admin Panel
        │
        ▼
┌─────────────────┐
│  auth.global.ts │  ← Middleware ตรวจสอบทุก route
│  (Global Guard) │
└────────┬────────┘
         │
    ยังไม่ login?
    ┌────┴────┐
    │ Yes     │ No (มี token แล้ว)
    ▼         ▼
  /login    เข้าหน้าที่ต้องการ
    │
    ├── กรอก username/password
    │   └── POST /api/v1/admin/auth/login
    │       └── รับ JWT token กลับมา
    │           └── เก็บลง localStorage + useState
    │               └── redirect ไป /
    │
    └── กด Demo Mode
        └── สร้าง mock token ใน client
            └── เปิด mock mode (ไม่ยิง API จริง)
                └── redirect ไป /
```

### 2. Route Guard Flow (การควบคุมสิทธิ์เข้าถึงหน้าต่างๆ)

```
ทุกการ navigate
      │
      ▼
┌─────────────────────┐
│  auth.global.ts     │
└─────────┬───────────┘
          │
    ┌─────┴──────┐
    │ มี token?   │
    └─────┬──────┘
      No  │  Yes
      │   │
      ▼   ├── Role = admin → เข้าได้ทุกหน้า
  /login  │
          ├── Role = user_account (editor) → เข้าได้ทุกหน้า ยกเว้น /users
          │
          └── Role = visitor → เข้าได้เฉพาะ / และ /contacts
```

### 3. Data Flow (การอ่าน-เขียนข้อมูล)

```
┌──────────┐     ┌───────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌────────────┐
│  Page    │────►│ useAdminApi() │────►│ usePortfolioApi │────►│ Go Backend   │────►│  Database  │
│  (.vue)  │     │ (wrapper)     │     │ + useApiClient  │     │ REST API     │     │  (MongoDB) │
│          │◄────│               │◄────│                 │◄────│ Port: 8080   │◄────│            │
└──────────┘     └───────────────┘     └─────────────────┘     └──────────────┘     └────────────┘
                                                 │
                                            Mock Mode?
                                                 │ Yes
                                                 ▼
                                          ┌──────────────┐
                                          │ useMockData()│
                                          │ (in-memory)  │
                                          └──────────────┘
```

**ขั้นตอนการทำงาน:**

1. Page component เรียก `useAdminApi()` เพื่อดึงหรือบันทึกข้อมูล
2. `useAdminApi` เป็น compatibility wrapper ที่ส่งงานต่อให้ `usePortfolioApi()` และ `useApiClient()`
3. API layer ตรวจว่าเป็น Mock Mode หรือไม่
   - **Mock Mode** → ใช้ข้อมูลจาก `useMockData()` (ไม่ยิง HTTP)
   - **Real Mode** → ยิง HTTP request ไปที่ Go Backend พร้อม Bearer token
4. Backend ประมวลผลและตอบกลับเป็น `ApiEnvelope<T>` format
5. Page component แสดงผลข้อมูลที่ได้รับ

### 4. CRUD Flow (การจัดการข้อมูล)

```
┌──────────────────────────────────────────────────────────┐
│                    Admin Page                             │
│                                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐  │
│  │ List │  │Create│  │ Edit │  │Delete│  │ Reorder  │  │
│  │      │  │      │  │      │  │      │  │ (บางหน้า) │  │
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └────┬─────┘  │
│     │GET      │POST     │PUT      │DELETE      │PUT     │
│     └─────────┴─────────┴─────────┴────────────┘        │
│                         │                                │
│                    useAdminApi()                          │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          ▼
                   Go Backend API
```

**ตัวอย่าง flow การแก้ไข Skill:**

1. เปิดหน้า `/skills` → `GET /api/v1/admin/skills` → แสดงรายการ
2. กดปุ่ม Edit → โหลดข้อมูลลง form
3. แก้ไขข้อมูลใน form → กด Save
4. `PUT /api/v1/admin/skills/:id` → ส่งข้อมูลไป Backend
5. สำเร็จ → แสดง Toast "success" → โหลดรายการใหม่
6. ล้มเหลว → แสดง Toast "error" พร้อมข้อความ

### 5. Image Upload Flow

```
ผู้ใช้เลือกไฟล์รูป
       │
       ▼
┌─────────────────────┐
│ FormImageUpload.vue │
│ - ตรวจ type (image) │
│ - ตรวจ size (< 5MB) │
└─────────┬───────────┘
          │
     ผ่าน validation?
     ┌────┴────┐
     │ No      │ Yes
     ▼         ▼
  แจ้ง error  ┌────────────────┐
              │ Mock Mode?     │
              └───┬────────┬───┘
                  │ Yes    │ No
                  ▼        ▼
          สร้าง blob URL  POST /api/v1/admin/upload
          (preview เท่านั้น) │ (multipart/form-data)
                            ▼
                    รับ path กลับมา
                            │
                            ▼
                   emit update:modelValue
                   (ส่ง path กลับ parent)
```

### 6. i18n Flow (การเปลี่ยนภาษา)

```
ผู้ใช้กดเปลี่ยนภาษา (LanguageSwitcher)
       │
       ▼
┌─────────────────────────┐
│ เปลี่ยน locale ใน useI18n │
│ (en ↔ th)               │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ บันทึกลง cookie          │
│ (i18n_locale)            │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ $t() ทุกที่อัพเดต        │
│ ข้อความเปลี่ยนภาษาทันที    │
└─────────────────────────┘
```

### 7. Layout & Navigation Flow

```
app.vue
  └── NuxtLayout
        │
        ├── layout: "auth" (เฉพาะ /login)
        │   └── auth.vue
        │       └── พื้นหลัง gradient + ช่อง login form
        │
        └── layout: "default" (ทุกหน้าอื่น)
            └── default.vue
                ├── AdminSidebar (ด้านซ้าย)
                │   ├── Logo
                │   ├── Navigation links (กรองตาม role)
                │   ├── Role badge
                │   └── Logout button
                │
                ├── AdminHeader (ด้านบน)
                │   ├── Menu toggle
                │   ├── Page title (ดึงจาก route)
                │   ├── Read-only badge (visitor)
                │   ├── Demo Mode badge (mock)
                │   └── LanguageSwitcher
                │
                └── <slot /> (เนื้อหาของแต่ละ page)
```

---

## สรุป Flow ทั้งหมดในภาพเดียว

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                  │
│  ┌─────────┐    ┌──────────────┐    ┌─────────────────────────┐ │
│  │  Login   │───►│ auth.global  │───►│     Default Layout      │ │
│  │  Page    │    │ (middleware) │    │  ┌────────┐ ┌────────┐  │ │
│  └─────────┘    └──────────────┘    │  │Sidebar │ │Header  │  │ │
│                                      │  └────────┘ └────────┘  │ │
│  ┌─────────┐                        │  ┌──────────────────┐    │ │
│  │ useAuth │ ← JWT + Role           │  │   Page Content   │    │ │
│  └─────────┘                        │  │  (CRUD / View)   │    │ │
│                                      │  └────────┬─────────┘    │ │
│  ┌──────────────┐                   └───────────┼──────────────┘ │
│  │ useAdminApi  │◄──────────────────────────────┘                │
│  │ (API layer)  │                                                │
│  └──────┬───────┘                                                │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐     ┌──────────┐
│  Go Backend     │────►│ Database │
│  Port: 8080     │◄────│ MongoDB  │
└─────────────────┘     └──────────┘
```
