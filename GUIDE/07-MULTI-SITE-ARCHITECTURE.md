# 07 — Multi-Site Admin Architecture

เอกสารนี้อธิบายแนวทางปรับ `Website_Config` จาก Admin Panel สำหรับ Portfolio ให้เป็น Admin Shell ที่รองรับหลายเว็บไซต์/หลาย domain ในอนาคต โดยยังไม่ทำให้ระบบ Portfolio เดิมพัง

---

## ใครต้องอ่านเอกสารนี้

- `Website_Config` — ต้องอ่านเพื่อปรับ Admin Panel ให้เลือก site ที่กำลังจัดการ และส่ง `siteId` ไปกับ API
- `Admin_Website_Management` — ต้องอ่านเพื่อเพิ่ม data model, API, permission และ ownership validation แบบ multi-site
- `Portfolio` หรือโปรเจกต์เว็บ port หน้าบ้าน — ต้องอ่านเพื่อเปลี่ยนจากการโหลดข้อมูล global เป็นโหลดข้อมูลตาม domain/site

ถ้าเริ่มทำ requirement ที่ user หลายคนมีเว็บ Portfolio แยกกันจริง เอกสารนี้ต้องถูกส่งให้ทั้ง 3 โปรเจกต์อ่านก่อนเริ่มแก้ เพราะ contract หลักคือ `site_id` ต้องตรงกันทุกฝั่ง

---

## เป้าหมายของโครงสร้างใหม่

โปรเจกต์นี้จัดการ Portfolio ผ่าน route หน้า admin เดิมได้ เช่น `/projects`, `/hero`, `/skills` แต่ API backend ถูกเปลี่ยนเป็น site-scoped routes แบบใหม่ทั้งหมด เพื่อรองรับ user หลายคนที่มี Portfolio แยกกัน เช่น:

- `portfolio` — เว็บ Portfolio ปัจจุบัน
- `shop` — เว็บซื้อของในอนาคต
- `finance` — เว็บบันทึกรายรับรายจ่ายในอนาคต

แนวทางปัจจุบันคือ **multi-site cutover**:

- ไม่ย้าย route เดิม เช่น `/projects`, `/hero`, `/skills`
- Portfolio CRUD ใช้ `/api/v1/admin/sites/:siteId/portfolio/...`
- ไม่รองรับ legacy portfolio API routes เดิมแล้ว
- แยก frontend structure ให้พร้อมรองรับ domain ใหม่
- backend ต้องมี `sites`, `site_members` และ `site_id` ก่อนใช้งานจริง

---

## โครงสร้าง Frontend ที่เพิ่มเข้ามา

```text
config/
├── modules.ts       # รายชื่อ module/site domain ที่ระบบรู้จัก
├── navigation.ts    # เมนู sidebar แบบ config-based
└── permissions.ts   # role hierarchy และ route access rules

composables/
├── useApiClient.ts      # HTTP client กลาง
├── usePortfolioApi.ts   # API เฉพาะ Portfolio
├── useSiteContext.ts    # selected site/workspace state สำหรับ multi-site
└── useAdminApi.ts       # compatibility wrapper สำหรับหน้าเดิม

types/
├── shared.ts       # shared API/helper types
├── auth.ts         # auth/users/RBAC types
├── site.ts         # managed sites และ member role
├── portfolio.ts    # portfolio domain types
└── admin.ts        # re-export เพื่อให้ imports เดิมยังใช้ได้
```

---

## Module Config

`config/modules.ts` เป็นจุดกลางสำหรับนิยาม module ที่ระบบรองรับ:

```ts
{
  id: 'portfolio',
  labelKey: 'nav.adminPanel',
  icon: 'mdi:briefcase-account',
  basePath: '/',
  apiNamespace: '/api/v1/admin',
  enabled: true,
}
```

สำหรับ module ใหม่ในอนาคตสามารถเพิ่ม config ได้ เช่น:

```ts
{
  id: 'shop',
  labelKey: 'modules.shop',
  icon: 'mdi:cart',
  basePath: '/shop',
  apiNamespace: '/api/v1/admin/shop',
  enabled: true,
}
```

> ตอนนี้ `shop` และ `finance` ถูกเตรียมไว้เป็น disabled placeholder เพื่อให้เห็นทิศทาง แต่ยังไม่สร้างหน้าใช้งานจริง

---

## Navigation Strategy

เดิม sidebar hardcode เมนูใน `components/AdminSidebar.vue` โดยตรง

ตอนนี้เมนูถูกย้ายไปที่ `config/navigation.ts` แล้ว:

```ts
{ labelKey: 'nav.projects', to: '/projects', icon: 'mdi:folder-multiple', minRole: 'editor', moduleId: 'portfolio' }
```

ข้อดี:

- เพิ่มเมนูของ `shop` หรือ `finance` ได้จาก config
- Sidebar ไม่ต้องรู้รายละเอียดแต่ละ domain
- route เดิมของ Portfolio ยังไม่เปลี่ยน
- สามารถเพิ่ม module switcher ในอนาคตได้ง่าย

---

## API Strategy

### Portfolio API ปัจจุบัน

Portfolio ใช้ endpoint ใหม่ที่มี `siteId` เท่านั้น:

```text
/api/v1/admin/sites/:siteId/portfolio/site-settings
/api/v1/admin/sites/:siteId/portfolio/hero
/api/v1/admin/sites/:siteId/portfolio/about
/api/v1/admin/sites/:siteId/portfolio/skills
/api/v1/admin/sites/:siteId/portfolio/projects
/api/v1/admin/sites/:siteId/portfolio/experiences
/api/v1/admin/sites/:siteId/portfolio/social-links
/api/v1/admin/sites/:siteId/portfolio/contacts
/api/v1/admin/sites/:siteId/portfolio/upload
```

`Website_Config` โหลดรายการ site จาก `GET /api/v1/admin/sites` แล้วเก็บ site ที่เลือกไว้ใน `useSiteContext.ts` จากนั้น `usePortfolioApi.ts` จะประกอบ path ด้วย `selectedSiteId`

### Site-scoped API สำหรับ Portfolio หลายเว็บ

เมื่อ backend รองรับ multi-site แล้ว Portfolio API ต้องใช้ endpoint ที่มี `siteId`:

```text
/api/v1/admin/sites/:siteId/portfolio/projects
```

`Website_Config` เตรียม `useSiteContext.ts` ไว้แล้ว:

- ถ้า `selectedSiteId` ยังเป็น `null` → ห้ามเรียก Portfolio API และต้องให้ user เลือก site ก่อน
- ถ้ามี `selectedSiteId` → ใช้ site-scoped endpoint เช่น `/api/v1/admin/sites/site-a/portfolio/projects`

ดังนั้น backend ต้องพร้อม route `/sites/:siteId/...` ก่อนใช้งาน admin จริง และไม่ต้องเก็บ route legacy คู่กัน

### API สำหรับเว็บใหม่ในอนาคต

เว็บใหม่ **ไม่จำเป็นต้องใช้ API เส้นเดิมของ Portfolio** เพราะ domain ไม่เหมือนกัน

ตัวอย่างเว็บซื้อของ:

```text
/api/v1/admin/shop/products
/api/v1/admin/shop/categories
/api/v1/admin/shop/orders
/api/v1/admin/shop/customers
```

ตัวอย่างเว็บรายรับรายจ่าย:

```text
/api/v1/admin/finance/incomes
/api/v1/admin/finance/expenses
/api/v1/admin/finance/categories
/api/v1/admin/finance/reports
```

ใน frontend ให้สร้าง composable แยก:

```text
composables/useShopApi.ts
composables/useFinanceApi.ts
```

โดยเรียกผ่าน `useApiClient()` เหมือน `usePortfolioApi.ts`

---

## ถ้าต้องรองรับหลายเว็บไซต์จริงๆ

ถ้าในอนาคตมีหลายเว็บ/หลาย tenant เช่น:

- Portfolio หลายเว็บ
- Shop หลายร้าน
- Finance หลาย workspace

Backend ควรเพิ่ม `site_id` หรือ `workspace_id`

ตัวอย่าง endpoint:

```text
/api/v1/admin/sites/:siteId/portfolio/projects
/api/v1/admin/sites/:siteId/shop/products
/api/v1/admin/workspaces/:workspaceId/finance/expenses
```

Frontend ควรเพิ่ม state สำหรับ selected site/workspace:

```text
composables/useSiteContext.ts
```

และส่ง `siteId`/`workspaceId` เข้า API composable ของแต่ละ domain

---

## Requirement ปัจจุบัน: user หลายคนมี Portfolio แยกกัน

Requirement นี้ต้องใช้ multi-site จริง ไม่ใช่แค่ role `super_admin`, `admin`, `editor`, `viewer`

ตัวอย่าง behavior:

- user A มีสิทธิ์ site A เท่านั้น → เห็นและแก้ได้เฉพาะ Portfolio ของ site A
- user B มีสิทธิ์ site B เท่านั้น → เห็นและแก้ได้เฉพาะ Portfolio ของ site B
- user A และ user B เป็นสมาชิกของ site A และ site B → ทั้งคู่เห็น selector/เมนูสำหรับจัดการ 2 site
- เว็บ port หน้าบ้านของ site A และ site B ต้องโหลดข้อมูลคนละชุดตาม domain หรือ subdomain

Backend ต้องเป็น source of truth ว่า user ไหนเข้าถึง site ไหนได้ Frontend แค่ช่วยแสดง UI ตามข้อมูลที่ backend ส่งมา ห้ามใช้ frontend อย่างเดียวเป็นตัวกันสิทธิ์

---

## Data Model ที่ Backend ต้องเพิ่ม

แนะนำให้เพิ่ม collection/table อย่างน้อย:

```text
sites
- id
- name
- slug
- domains
- created_at
- updated_at

site_members
- site_id
- user_id
- created_at
- updated_at
```

ข้อมูล Portfolio ทุก collection ต้องมี `site_id`:

```text
site_settings.site_id
hero.site_id
about.site_id
skills.site_id
projects.site_id
experiences.site_id
social_links.site_id
contacts.site_id
uploads.site_id
```

ต้องทำ unique index โดยผูกกับ `site_id` เช่น `skills` อาจ unique ตาม `(site_id, name)` แทน unique แค่ `name` เพื่อไม่ให้ข้อมูลของคนละเว็บชนกัน

---

## Contract ที่ Backend ต้องทำ

Admin API:

```text
GET    /api/v1/admin/sites
POST   /api/v1/admin/sites
GET    /api/v1/admin/sites/:siteId
PUT    /api/v1/admin/sites/:siteId
DELETE /api/v1/admin/sites/:siteId

GET    /api/v1/admin/sites/:siteId/portfolio/site-settings
PUT    /api/v1/admin/sites/:siteId/portfolio/site-settings
GET    /api/v1/admin/sites/:siteId/portfolio/hero
PUT    /api/v1/admin/sites/:siteId/portfolio/hero
GET    /api/v1/admin/sites/:siteId/portfolio/about
PUT    /api/v1/admin/sites/:siteId/portfolio/about
GET    /api/v1/admin/sites/:siteId/portfolio/skills
POST   /api/v1/admin/sites/:siteId/portfolio/skills
PUT    /api/v1/admin/sites/:siteId/portfolio/skills/:id
DELETE /api/v1/admin/sites/:siteId/portfolio/skills/:id
GET    /api/v1/admin/sites/:siteId/portfolio/projects
POST   /api/v1/admin/sites/:siteId/portfolio/projects
PUT    /api/v1/admin/sites/:siteId/portfolio/projects/:id
DELETE /api/v1/admin/sites/:siteId/portfolio/projects/:id
```

ทุก handler ต้อง:

- อ่าน `user_id` จาก JWT context
- ตรวจว่า `user_id` เป็น member ของ `siteId`
- ใช้ global role (`super_admin`, `admin`, `editor`, `viewer`) เป็นตัวตัดสินสิทธิ์อ่าน/เขียน
- query/update ข้อมูลด้วย filter ที่มี `site_id` เสมอ
- ห้ามรับ `site_id` จาก request body แล้วเชื่อทันที ให้ใช้ `siteId` จาก path ที่ผ่าน permission check แล้ว

Public API สำหรับเว็บ port:

```text
GET /api/v1/public/sites/by-domain?host=:hostname
GET /api/v1/public/sites/:siteId/portfolio
POST /api/v1/public/sites/:siteId/portfolio/contacts
```

เว็บ port ต้อง resolve site จาก domain ก่อน แล้วใช้ `siteId` ที่ได้ไปดึงข้อมูล portfolio ของ site นั้น

---

## สิ่งที่โปรเจกต์ Portfolio/port ต้องปรับ

เว็บ port หน้าบ้านต้องเลิกโหลดข้อมูลแบบ global และต้องโหลดตาม domain/site ผ่าน public multi-site endpoints

Flow ที่แนะนำ:

```text
1. อ่าน host ปัจจุบันจาก browser/server request
2. เรียก backend เพื่อ resolve host เป็น site
3. ใช้ siteId โหลด hero, about, skills, projects, experiences, social links
4. contact form ต้อง POST ไปที่ siteId เดียวกัน
```

ถ้าเว็บ port เป็น Nuxt/SSR ควร resolve host ฝั่ง server เพื่อให้ SEO และ metadata ถูกต้องตั้งแต่ render แรก ถ้าเป็น SPA อย่างเดียวต้อง resolve ตอน client load และจัด loading/error state ให้ชัดเจน

---

## Auth, Users และ Site Membership

ระบบ multi-site ใช้ role ใหม่:

- `super_admin`: เห็นทุก site และจัดการทุก user ได้
- `admin`: เห็น/จัดการเฉพาะ site ที่ได้รับสิทธิ์ และจัดการ user ใน scope เดียวกันได้
- `editor`: แก้ content ของ site ที่ได้รับสิทธิ์ แต่ไม่เห็น User Management
- `viewer`: เห็นเฉพาะ Messages/Contacts ของ site ที่ได้รับสิทธิ์

`site_members` เป็น access list เท่านั้น ไม่ใช้ per-site role ใน UI แล้ว หน้า Users ของ `Website_Config` ต้องให้เลือกได้ว่า user แต่ละคนเข้าถึง site ไหนบ้าง โดยเรียก:

```text
GET /api/v1/admin/users/:id/memberships
PUT /api/v1/admin/users/:id/memberships
```

เมื่อ user login แล้ว sidebar จะแสดงเฉพาะ site ที่ backend ส่งมาจาก `GET /api/v1/admin/sites`

---

## สิ่งที่ Backend API ต้องปรับตอนนี้

Backend `Admin_Website_Management` ต้องใช้ multi-site เป็น contract หลักแล้ว เพราะ requirement คือ user หลายคนมี Portfolio แยกกัน การแยกข้อมูลจริงต้องเกิดที่ database และ API ไม่ใช่แค่ frontend

### 1. แยก API namespace ตาม domain

Portfolio admin routes ต้องมี `siteId` เสมอ:

```text
/api/v1/admin/sites/:siteId/portfolio/projects
/api/v1/admin/shop/products
/api/v1/admin/finance/expenses
```

ไม่ต้อง preserve backward compatibility กับ legacy Portfolio routes เดิม ให้ลบ route เดิมในกลุ่ม Portfolio ออกทั้งหมด

### 2. แยก handler/service/repository ตาม domain

ตัวอย่าง:

```text
internal/handler/portfolio/
internal/handler/shop/
internal/handler/finance/

internal/service/portfolio/
internal/service/shop/
internal/service/finance/

internal/repository/portfolio/
internal/repository/shop/
internal/repository/finance/
```

### 3. เพิ่ม permission model

Role เดิมยังใช้ได้ช่วงแรก แต่ถ้าหลายเว็บจริงควรมี permission table/claims:

```json
{
  "sub": "user-id",
  "role": "admin",
  "permissions": [
    "portfolio:write",
    "shop:orders:read",
    "finance:reports:read"
  ]
}
```

### 4. เพิ่ม site/workspace model เมื่อมีหลาย tenant

ควรเพิ่ม entity เช่น:

```text
sites
workspaces
user_workspace_roles
```

เพื่อกำหนดว่า user คนไหนจัดการเว็บไหนได้บ้าง

---

## Migration Plan แนะนำตาม decision ล่าสุด

### Phase 1 — Backend multi-site cutover

- ลบ legacy Portfolio routes เดิมออก
- เพิ่ม `sites`, `site_members`, `site_id` ใน database schema
- ตั้ง `RESET_DATABASE_ON_START=true` เพื่อ reset database/collections เก่า แล้ว seed ใหม่ตอนรัน server
- เพิ่ม site-scoped admin routes และ public routes ตามเอกสารนี้

### Phase 2 — Website_Config site selector

- โหลด `GET /api/v1/admin/sites`
- เก็บ `selectedSiteId`
- เรียก Portfolio API ด้วย `/api/v1/admin/sites/:siteId/portfolio/...` เท่านั้น
- อัปโหลดไฟล์ผ่าน `/api/v1/admin/sites/:siteId/portfolio/upload`

### Phase 3 — Portfolio/port frontend

- resolve site จาก hostname/domain
- โหลด public portfolio data ตาม `siteId`
- ส่ง contact form ไปยัง `/api/v1/public/sites/:siteId/portfolio/contacts`

### Phase 4 — Permission-based RBAC

- เพิ่ม permissions ใน user model หรือ JWT claims
- ปรับ frontend navigation/middleware ให้เช็ค permission ราย module
- ปรับ backend middleware ให้เช็ค permission ราย endpoint

### Phase 5 — เพิ่ม domain ใหม่ใน frontend

- เพิ่ม types ใหม่ เช่น `types/shop.ts`
- เพิ่ม API composable เช่น `useShopApi.ts`
- เพิ่ม pages ใหม่ใต้ route namespace เช่น `pages/shop/products.vue`
- เพิ่มเมนูใน `config/navigation.ts`

### Phase 6 — Public domain routing

- เพิ่ม domain/subdomain mapping ใน backend
- ปรับเว็บ port ให้ resolve site จาก hostname
- เพิ่ม public API ที่คืนข้อมูลเฉพาะ site
- ตั้ง CORS/hosting ให้รองรับ admin domain และ public portfolio domains ตาม `GUIDE/08-CORS-AND-LOCAL-DEV.md`

---

## สรุปคำตอบเรื่อง API

- เว็บใหม่ในอนาคต **ไม่จำเป็นต้องใช้ API เส้นเดิมของ Portfolio**
- API เดิมของ Portfolio ไม่ต้องเก็บไว้ ให้ใช้ site-scoped routes ใหม่ทั้งหมด
- ข้อมูล portfolio เดิมไม่ต้อง migrate ให้ reset database/collections แล้ว seed ใหม่
- Users/Auth ยังใช้ JWT เดิมได้ แต่ backend ต้องเพิ่ม site membership check สำหรับทุก route ที่มี `siteId`
- `Website_Config` ต้องเลือก site ก่อนเรียก Portfolio API
