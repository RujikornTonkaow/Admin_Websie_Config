# 02 — File Reference (รายละเอียดไฟล์ทั้งหมด)

เอกสารนี้อธิบายว่าแต่ละไฟล์ในโปรเจกต์ทำหน้าที่อะไร เพื่อให้นักพัฒนาที่ clone โปรเจกต์ไปเข้าใจได้ทันที

---

## โครงสร้างโปรเจกต์ (Directory Tree)

```
Website_Config/
├── app.vue                          # Root component
├── nuxt.config.ts                   # Nuxt configuration
├── package.json                     # Dependencies & scripts
├── package-lock.json                # Dependency lock file
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind CSS config
├── .env.example                     # ตัวอย่างตัวแปร environment
├── .gitignore                       # Git ignore rules
├── README.md                        # README ภาพรวมโปรเจกต์
├── RBAC_BACKEND_CHANGES.md          # บันทึกการแก้ไข Backend สำหรับ RBAC
│
├── assets/
│   └── css/
│       └── tailwind.css             # Tailwind CSS entry point
│
├── components/
│   ├── AdminHeader.vue              # แถบด้านบน (top bar)
│   ├── AdminSidebar.vue             # แถบด้านข้าง (sidebar navigation)
│   ├── ConfirmDialog.vue            # Dialog ยืนยันการลบ
│   ├── FormImageUpload.vue          # Component อัพโหลดรูปภาพ
│   ├── FormTagInput.vue             # Component ใส่ tag แบบ chip
│   ├── LanguageSwitcher.vue         # ปุ่มเปลี่ยนภาษา (EN/TH)
│   └── Toast.vue                    # แจ้งเตือนแบบ popup
│
├── composables/
│   ├── useApiClient.ts              # HTTP client กลาง
│   ├── useAdminApi.ts               # API layer หลัก
│   ├── usePortfolioApi.ts           # API เฉพาะ Portfolio
│   ├── useAuth.ts                   # ระบบ Authentication
│   └── useMockData.ts               # ข้อมูล mock สำหรับ Demo Mode
│
├── config/
│   ├── modules.ts                   # นิยาม module/site domain
│   ├── navigation.ts                # Sidebar navigation config
│   └── permissions.ts               # Role และ route access rules
│
├── i18n/
│   ├── i18n.config.ts               # ตั้งค่า Vue I18n
│   └── locales/
│       ├── en.json                   # ข้อความภาษาอังกฤษ
│       └── th.json                   # ข้อความภาษาไทย
│
├── layouts/
│   ├── auth.vue                     # Layout สำหรับหน้า Login
│   └── default.vue                  # Layout หลัก (Sidebar + Header)
│
├── middleware/
│   └── auth.global.ts               # Route guard ตรวจสอบสิทธิ์
│
├── pages/
│   ├── index.vue                    # Dashboard
│   ├── login.vue                    # หน้า Login
│   ├── site-settings.vue            # ตั้งค่าเว็บไซต์
│   ├── hero.vue                     # จัดการ Hero section
│   ├── about.vue                    # จัดการ About section
│   ├── skills.vue                   # จัดการ Skills
│   ├── projects.vue                 # จัดการ Projects
│   ├── experiences.vue              # จัดการ Experiences
│   ├── social-links.vue             # จัดการ Social Links
│   ├── contacts.vue                 # จัดการ Contact Messages
│   └── users.vue                    # จัดการผู้ใช้งาน (admin+)
│
├── types/
│   ├── admin.ts                     # Re-export types เดิมเพื่อ backward compatibility
│   ├── auth.ts                      # Auth/users/RBAC types
│   ├── portfolio.ts                 # Portfolio domain types
│   └── shared.ts                    # Shared API/helper types
│
└── GUIDE/
    └── (เอกสารที่คุณกำลังอ่าน)
```

---

## ไฟล์ Root

### `app.vue`

Root component ของ Nuxt 3 ทำหน้าที่เป็น shell หลักของแอปทั้งหมด

- รวม `<NuxtLayout>` + `<NuxtPage />` เข้าด้วยกัน
- Layout จะถูกเลือกตาม `definePageMeta({ layout: '...' })` ในแต่ละ page

### `nuxt.config.ts`

ไฟล์ตั้งค่าหลักของ Nuxt 3:

| การตั้งค่า | รายละเอียด |
|------------|-----------|
| `ssr: false` | ปิด Server-Side Rendering (ทำงานเป็น SPA) |
| `modules` | โหลด Tailwind CSS, Nuxt Icon, i18n |
| `runtimeConfig.public.apiBaseUrl` | URL ของ Backend API (default: `http://localhost:8080`) |
| `i18n` | ตั้งค่าภาษา EN/TH, strategy `no_prefix` (URL ไม่มี `/en`, `/th`) |
| `app.head` | Title, Meta, Google Fonts (Inter) |

### `package.json`

| Script | คำสั่ง | คำอธิบาย |
|--------|--------|---------|
| `dev` | `nuxt dev --port 3001` | เริ่ม dev server ที่ port 3001 |
| `build` | `nuxt build` | Build สำหรับ production |
| `generate` | `nuxt generate` | Generate static files |
| `preview` | `nuxt preview` | Preview production build |
| `lint` | `eslint .` | ตรวจสอบ code style |
| `typecheck` | `nuxt typecheck` | ตรวจสอบ TypeScript types |

### `tailwind.config.ts`

- กำหนด content paths สำหรับ Tailwind purge
- เพิ่ม font family `Inter` เป็น default sans-serif

### `.env.example`

ตัวอย่าง environment variables:

```
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### `README.md`

- README เดิมของโปรเจกต์ ระบุภาพรวม, features, getting started
- ระบุชื่อ Backend project: `Admin_Website_Management`
- ระบุ default credentials: `admin` / `changeme123`

### `RBAC_BACKEND_CHANGES.md`

- เอกสารบันทึกการแก้ไข Backend (Go) เพื่อรองรับระบบ RBAC 3 roles
- ระบุไฟล์ที่แก้ใน Backend, route permissions, migration script สำหรับ database เดิม
- มี API request/response examples สำหรับ user management

---

## Components (7 ไฟล์)

### `AdminSidebar.vue`

**หน้าที่:** แถบ Navigation ด้านซ้ายของ Admin Panel

- แสดง Logo และชื่อแอป
- แสดง Navigation links ที่กรองตาม role ของผู้ใช้ (`minRole`)
- Highlight link ที่ active ตาม route ปัจจุบัน
- แสดง Role badge (`super_admin` / `admin` / `editor` / `viewer`)
- ปุ่ม Logout
- รองรับ collapse/expand
- ใช้ i18n สำหรับ label ทุกตัว

| Props | Type | คำอธิบาย |
|-------|------|---------|
| `collapsed` | `boolean` | สถานะ sidebar ย่อ/ขยาย |

### `AdminHeader.vue`

**หน้าที่:** แถบด้านบนของ Admin Panel

- ปุ่ม toggle sidebar (hamburger menu)
- แสดง page title ที่ดึงจาก route path + i18n
- แสดง badge "Read-only" สำหรับ `viewer` (non-mock mode)
- แสดง badge "Demo Mode" เมื่ออยู่ใน mock mode
- มี `LanguageSwitcher` component

| Emits | คำอธิบาย |
|-------|---------|
| `toggle-sidebar` | สั่งให้ layout toggle sidebar |

### `ConfirmDialog.vue`

**หน้าที่:** Modal dialog สำหรับยืนยันการดำเนินการ (เช่น ลบข้อมูล)

- ใช้ `<Teleport to="body">` เพื่อแสดงเป็น overlay
- กดพื้นหลัง (backdrop) = ยกเลิก
- รองรับ loading state บนปุ่ม confirm

| Props | Type | คำอธิบาย |
|-------|------|---------|
| `open` | `boolean` | เปิด/ปิด dialog |
| `title` | `string` | หัวข้อ dialog |
| `message` | `string` | ข้อความรายละเอียด |
| `confirmText` | `string?` | ข้อความปุ่มยืนยัน (default: "Delete") |
| `loading` | `boolean?` | แสดง loading บนปุ่ม |

| Emits | คำอธิบาย |
|-------|---------|
| `confirm` | ผู้ใช้กดยืนยัน |
| `cancel` | ผู้ใช้กดยกเลิก |

### `FormImageUpload.vue`

**หน้าที่:** Component สำหรับเลือกและอัพโหลดรูปภาพ

- เลือกไฟล์จาก file input
- Validate ประเภทไฟล์ (image/*) และขนาด (< 5MB)
- อัพโหลดผ่าน `useAdminApi().upload()` (multipart/form-data)
- แสดง preview รูปภาพ
- Mock mode: สร้าง blob URL แทนการอัพโหลดจริง
- ใช้ `v-model` pattern (`modelValue` / `update:modelValue`)

| Props | Type | คำอธิบาย |
|-------|------|---------|
| `modelValue` | `string` | path ของรูปภาพปัจจุบัน |
| `label` | `string` | label ของ input |
| `helpText` | `string?` | ข้อความช่วยเหลือ |

**ใช้ในหน้า:** `projects.vue`, `site-settings.vue`

### `FormTagInput.vue`

**หน้าที่:** Input แบบ chip/tag สำหรับใส่หลายค่า

- กด Enter หรือพิมพ์ comma เพื่อเพิ่ม tag
- กด X บน chip เพื่อลบ tag
- blur จะ commit text ที่ค้างอยู่
- รองรับ comma/newline split เมื่อ paste
- ใช้ `v-model` pattern

| Props | Type | คำอธิบาย |
|-------|------|---------|
| `modelValue` | `string[]` | รายการ tags ปัจจุบัน |
| `label` | `string` | label ของ input |
| `placeholder` | `string?` | placeholder text |

**ใช้ในหน้า:** `about.vue` (personality tags), `projects.vue` (technologies)

### `LanguageSwitcher.vue`

**หน้าที่:** Dropdown เปลี่ยนภาษาระหว่าง English และ ไทย

- แสดง locale ปัจจุบัน
- กดเพื่อเปิด dropdown แสดง locale ทั้งหมด
- click-outside ปิด dropdown
- เปลี่ยน `locale` ของ `useI18n()` โดยตรง

**ใช้ใน:** `AdminHeader.vue`, `login.vue`

### `Toast.vue`

**หน้าที่:** แจ้งเตือนแบบ popup มุมขวาบน

- แสดงข้อความพร้อม icon ตาม type
- Auto-close หลัง ~4 วินาที
- กดปุ่ม X เพื่อปิดด้วยตนเอง

| Props | Type | คำอธิบาย |
|-------|------|---------|
| `message` | `string` | ข้อความแจ้งเตือน |
| `type` | `'success' \| 'error' \| 'info'` | ประเภท (default: `info`) |

| Emits | คำอธิบาย |
|-------|---------|
| `close` | toast ถูกปิด |

**ใช้ในเกือบทุกหน้า** ยกเว้น `index.vue` และ `login.vue`

---

## Composables (5 ไฟล์)

### `useApiClient.ts`

**หน้าที่:** HTTP client กลางสำหรับทุก domain/module

- อ่าน `runtimeConfig.public.apiBaseUrl`
- แนบ Bearer token ผ่าน `getAuthHeaders()`
- จัดการ error กลาง (`401` → logout, `403` → permission error)
- มี `apiFetch<T>()` สำหรับ response ปกติ
- มี `apiFetchWithMeta<T>()` สำหรับ response ที่ต้องใช้ `meta`
- มี `upload()` และ `getUploadUrl()` สำหรับ file upload/preview

### `usePortfolioApi.ts`

**หน้าที่:** API เฉพาะ Portfolio domain

- ครอบ API Portfolio แบบ site-scoped ผ่าน `useSiteContext()`
- ใช้ endpoint ใหม่ เช่น `/api/v1/admin/sites/{siteId}/portfolio/projects`
- รองรับ Mock Mode ผ่าน `useMockData.ts`
- แยก Portfolio ออกจาก `useAdminApi.ts` เพื่อเตรียมเพิ่ม domain ใหม่ เช่น shop/finance

### `useAuth.ts`

**หน้าที่:** จัดการ Authentication ทั้งหมด

| ฟังก์ชัน/ค่า | คำอธิบาย |
|--------------|---------|
| `login(credentials)` | POST ไปที่ Backend เพื่อรับ JWT token |
| `loginDemo()` | เข้า Demo Mode ด้วย mock token (ไม่ต้องมี Backend) |
| `logout()` | ล้าง token และ redirect ไป /login |
| `getAuthHeaders()` | คืน `{ Authorization: 'Bearer ...' }` สำหรับ API calls |
| `isAuthenticated` | computed: มี token หรือไม่ |
| `isSuperAdmin` | computed: role เป็น `super_admin` หรือไม่ |
| `isAdmin` | computed: role level `admin+` หรือไม่ |
| `isEditor` | computed: role level `editor+` หรือไม่ |
| `canManageUsers` | computed: role level `admin+` หรือไม่ |
| `hasRole(role)` | ตรวจว่า role ปัจจุบัน >= role ที่กำหนด |
| `isMockMode` | computed: อยู่ใน Demo Mode หรือไม่ |
| `userRole` | computed: role ปัจจุบัน |
| `currentUserId` | computed: user ID จาก JWT |

**State ที่ใช้ (`useState`):**
- `auth_token` — JWT token string
- `mock_mode` — boolean สถานะ Demo Mode
- `user_role` — role ของผู้ใช้ปัจจุบัน
- `current_user_id` — ID ของผู้ใช้ปัจจุบัน

### `useAdminApi.ts`

**หน้าที่:** Compatibility wrapper สำหรับหน้าเดิม

- รวม `usePortfolioApi()` + users + upload/getUploadUrl
- ทำให้หน้าเดิมที่เรียก `useAdminApi()` ยังทำงานได้โดยไม่ต้องแก้ imports
- เป็น bridge ระหว่างโครงสร้าง Portfolio เดิมกับ multi-site architecture ใหม่

| กลุ่ม method | Endpoints ที่ครอบ |
|-------------|------------------|
| `siteSettings` | GET / PUT site settings |
| `hero` | GET / PUT hero section |
| `about` | GET / PUT about section |
| `skills` | CRUD skills |
| `projects` | CRUD projects + reorder |
| `experiences` | CRUD experiences + reorder |
| `socialLinks` | CRUD social links |
| `contacts` | List / Get / Delete contact messages |
| `users` | CRUD users + change password |
| `upload()` | อัพโหลดไฟล์ (multipart) |
| `getUploadUrl()` | สร้าง URL สำหรับแสดง preview รูป |

### `useMockData.ts`

**หน้าที่:** จัดเก็บข้อมูล mock สำหรับ Demo Mode

- export ข้อมูลตัวอย่างทุก entity (SiteSettings, Hero, About, Skills, Projects, Experiences, SocialLinks, Contacts)
- ใช้เมื่อ `isMockMode = true` ใน `useAdminApi`
- ข้อมูลจะอยู่ใน memory เท่านั้น (ไม่ persist)

---

## Pages (11 ไฟล์)

### `index.vue` — Dashboard (`/`)

- แสดงสถิติรวม: จำนวน Skills, Projects, Experiences, Messages
- แสดง Quick Actions สำหรับ editor ขึ้นไป
- แสดง Recent Messages (5 ข้อความล่าสุด)
- `viewer` เห็นเฉพาะ stats ข้อความ

### `login.vue` — Login (`/login`)

- ใช้ layout `auth` (ไม่มี sidebar)
- Form: username + password
- ปุ่ม Demo Mode สำหรับทดลองใช้งานโดยไม่ต้องมี Backend
- มี LanguageSwitcher

### `site-settings.vue` — Site Settings (`/site-settings`)

- แก้ไขชื่อเว็บ (site title, page title), meta description, footer tagline
- เลือก default theme (midnight/sunshine)
- อัพโหลด profile image ผ่าน `FormImageUpload`

### `hero.vue` — Hero Section (`/hero`)

- แก้ไข greeting, full_name, subtitle
- ตั้งค่า CTA Primary (text + link)
- ตั้งค่า CTA Secondary (text + link)

### `about.vue` — About Section (`/about`)

- แก้ไข title, bio_paragraphs (เพิ่ม/ลบได้)
- จัดการ personality tags ผ่าน `FormTagInput`
- จัดการ stats (value/label pairs, เพิ่ม/ลบได้)

### `skills.vue` — Skills (`/skills`)

- CRUD: สร้าง, แก้ไข, ลบ skill
- กำหนดชื่อ, Iconify icon string, category (Frontend/Backend/DevOps/Tools)
- ไม่มี reorder

### `projects.vue` — Projects (`/projects`)

- CRUD: สร้าง, แก้ไข, ลบ project
- กำหนดชื่อ, description, image, tags (เทคโนโลยี), live_url, source_url
- **Reorder**: เลื่อนลำดับขึ้น/ลงได้

### `experiences.vue` — Experiences (`/experiences`)

- CRUD: สร้าง, แก้ไข, ลบ experience
- กำหนดตำแหน่ง (role), บริษัท, ช่วงเวลา, description, highlights (เพิ่ม/ลบได้)
- **Reorder**: เลื่อนลำดับขึ้น/ลงได้

### `social-links.vue` — Social Links (`/social-links`)

- CRUD: สร้าง, แก้ไข, ลบ social link
- กำหนดชื่อ, URL, Iconify icon string

### `contacts.vue` — Contact Messages (`/contacts`)

- แสดงรายการข้อความจากผู้เข้าชมเว็บ
- เปิดอ่านรายละเอียดข้อความ (mark as read)
- ลบข้อความ (เฉพาะ editor ขึ้นไป)
- `viewer` ดูได้อย่างเดียว

### `users.vue` — User Management (`/users`)

- `admin+` เท่านั้น — `editor` และ `viewer` เข้าไม่ได้
- CRUD: สร้าง, แก้ไข, ลบ user
- เปลี่ยน password ของ user
- เปลี่ยน role (`admin` / `editor` / `viewer`) ส่วน `super_admin` สร้างได้เฉพาะ `super_admin`
- ไม่สามารถลบตัวเอง

---

## Layouts (2 ไฟล์)

### `default.vue`

- Layout หลักสำหรับทุกหน้า (ยกเว้น login)
- ประกอบด้วย `AdminSidebar` + `AdminHeader` + `<slot />`
- Sidebar รองรับ collapse/expand
- Responsive margin ปรับตาม sidebar width

### `auth.vue`

- Layout สำหรับหน้า Login เท่านั้น
- พื้นหลัง gradient (slate-900 → indigo-950)
- Content อยู่กลางจอ

---

## Middleware (1 ไฟล์)

### `auth.global.ts`

- **Global middleware** — ทำงานทุกครั้งที่ navigate
- ตรวจสอบ authentication (มี token หรือไม่)
- ตรวจสอบ authorization (role มีสิทธิ์เข้าหน้านั้นหรือไม่)
- Redirect ไป `/login` ถ้ายังไม่ login
- Redirect ไป `/` ถ้า role ไม่มีสิทธิ์เข้าหน้านั้น

---

## Config (3 ไฟล์)

### `config/modules.ts`

- นิยาม module/domain ที่ Admin Shell รู้จัก เช่น `portfolio`, `shop`, `finance`
- ระบุ `basePath`, `apiNamespace`, icon, label key และสถานะ `enabled`
- `portfolio`, `shop`, `finance` เปิดได้จาก config แต่ sidebar จะแสดง module ก็ต่อเมื่อ backend ส่ง site type นั้นกลับมา

### `config/navigation.ts`

- รวม sidebar menu configuration ออกจาก `AdminSidebar.vue`
- แต่ละรายการระบุ `labelKey`, `to`, `icon`, `minRole`, `moduleId`
- ทำให้เพิ่มเมนูของเว็บไซต์/domain ใหม่ได้โดยไม่ต้องแก้ component

### `config/permissions.ts`

- รวม role hierarchy (`viewer`, `editor`, `admin`, `super_admin`)
- รวม route access rules เช่น viewer allowed paths, user management paths และ super-admin-only paths
- มี helper functions เช่น `hasMinimumRole()`, `canAccessUserManagementPath()`, `canAccessSuperAdminPath()`, `canViewerAccessPath()`

---

## Types (4 ไฟล์)

### `types/admin.ts`

- Re-export types จาก `auth.ts`, `portfolio.ts`, `shared.ts`
- เก็บ `SidebarLink` สำหรับ sidebar navigation
- มีไว้เพื่อ backward compatibility ให้ imports เดิมจาก `~/types/admin` ยังใช้ได้

### `types/auth.ts`

- `UserRole`: `super_admin | admin | editor | viewer`
- User management types: `AdminUser`, `CreateUserRequest`, `UpdateUserRequest`, `ChangePasswordRequest`
- Login types: `LoginRequest`, `LoginResponse`, `LoginUser`

### `types/portfolio.ts`

- Portfolio domain types: `SiteSettings`, `Hero`, `About`, `Stat`, `Skill`, `Project`, `Experience`, `SocialLink`, `ContactMessage`
- `SkillCategory`: `frontend | backend | devops | tools`

### `types/shared.ts`

- Shared API/helper types: `ApiEnvelope<T>`, `UploadResponse`, `ReorderRequest`, `NavItem`

---

## i18n (3 ไฟล์)

### `i18n/i18n.config.ts`

- ตั้งค่า Vue I18n: `legacy: false`, fallback locale `en`
- Import และ register locale messages จาก JSON files

### `i18n/locales/en.json`

- ข้อความภาษาอังกฤษทั้งหมดของ Admin Panel
- โครงสร้าง nested: `common`, `nav`, `roles`, `login`, `dashboard`, `siteSettings`, `hero`, `about`, `skills`, `projects`, `experiences`, `socialLinks`, `users`, `contacts`, `formTagInput`, `formImageUpload`

### `i18n/locales/th.json`

- ข้อความภาษาไทยทั้งหมด (structure เดียวกับ `en.json`)

---

## Assets (1 ไฟล์)

### `assets/css/tailwind.css`

- Entry point ของ Tailwind CSS
- มี `@tailwind base`, `@tailwind components`, `@tailwind utilities`
