# 07 — Multi-Site Admin Architecture

เอกสารนี้อธิบายแนวทางปรับ `Website_Config` จาก Admin Panel สำหรับ Portfolio ให้เป็น Admin Shell ที่รองรับหลายเว็บไซต์/หลาย domain ในอนาคต โดยยังไม่ทำให้ระบบ Portfolio เดิมพัง

---

## เป้าหมายของโครงสร้างใหม่

โปรเจกต์นี้ยังคงจัดการ Portfolio ผ่าน route และ API เดิมได้ตามปกติ แต่โครงสร้างภายในถูกเตรียมให้เพิ่ม module อื่นได้ง่าย เช่น:

- `portfolio` — เว็บ Portfolio ปัจจุบัน
- `shop` — เว็บซื้อของในอนาคต
- `finance` — เว็บบันทึกรายรับรายจ่ายในอนาคต

แนวทางนี้เรียกว่า **safe prepare**:

- ไม่ย้าย route เดิม เช่น `/projects`, `/hero`, `/skills`
- ไม่เปลี่ยน API เดิม เช่น `/api/v1/admin/projects`
- แยก frontend structure ให้พร้อมรองรับ domain ใหม่
- ยังไม่บังคับให้ backend ต้อง refactor ทันที

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
└── useAdminApi.ts       # compatibility wrapper สำหรับหน้าเดิม

types/
├── shared.ts       # shared API/helper types
├── auth.ts         # auth/users/RBAC types
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
{ labelKey: 'nav.projects', to: '/projects', icon: 'mdi:folder-multiple', minRole: 'user_account', moduleId: 'portfolio' }
```

ข้อดี:

- เพิ่มเมนูของ `shop` หรือ `finance` ได้จาก config
- Sidebar ไม่ต้องรู้รายละเอียดแต่ละ domain
- route เดิมของ Portfolio ยังไม่เปลี่ยน
- สามารถเพิ่ม module switcher ในอนาคตได้ง่าย

---

## API Strategy

### Portfolio API ปัจจุบัน

Portfolio ยังคงใช้ endpoint เดิม:

```text
/api/v1/admin/site-settings
/api/v1/admin/hero
/api/v1/admin/about
/api/v1/admin/skills
/api/v1/admin/projects
/api/v1/admin/experiences
/api/v1/admin/social-links
/api/v1/admin/contacts
```

`usePortfolioApi.ts` ใช้ `apiNamespace` จาก `config/modules.ts` ซึ่งตอนนี้เป็น:

```text
/api/v1/admin
```

ดังนั้น endpoint เดิมยังคงเหมือนเดิมทั้งหมด

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
composables/useWorkspace.ts
```

และส่ง `siteId`/`workspaceId` เข้า API composable ของแต่ละ domain

---

## Auth และ Users ต้องแก้ตอนนี้ไหม

ตอนนี้ **ยังไม่จำเป็นต้องแก้ users/auth ทันที**

เหตุผล:

- Auth ยังเป็น cross-cutting concern ใช้ร่วมได้ทุก module
- `users` ยังอยู่ใน `useAdminApi.ts` เป็น compatibility layer ได้
- Role ปัจจุบัน (`admin`, `user_account`, `visitor`) ยังพอใช้กับ Portfolio เดิม
- การแยก API client แล้วทำให้แก้ backend auth/users ทีหลังได้ง่ายขึ้น

แต่ถ้าระบบเริ่มมีหลาย module จริง ควรเปลี่ยนจาก role กว้างๆ เป็น permission-based access control

ตัวอย่าง permission:

```text
portfolio:read
portfolio:write
shop:products:read
shop:orders:write
finance:reports:read
users:manage
```

---

## สิ่งที่ Backend API ควรปรับในอนาคต

Backend `Admin_Website_Management` ยังไม่จำเป็นต้องปรับทันทีถ้ายังจัดการ Portfolio อย่างเดียว

ควรปรับเมื่อเริ่มเพิ่มเว็บ/domain ใหม่ เช่น shop หรือ finance

### 1. แยก API namespace ตาม domain

จากเดิม:

```text
/api/v1/admin/projects
```

เป็น:

```text
/api/v1/admin/portfolio/projects
/api/v1/admin/shop/products
/api/v1/admin/finance/expenses
```

หรือถ้าต้อง preserve backward compatibility:

```text
/api/v1/admin/projects                  # legacy portfolio route
/api/v1/admin/portfolio/projects        # new explicit route
```

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

## Migration Plan แนะนำ

### Phase 1 — Frontend safe prepare (ทำแล้วในโปรเจกต์นี้)

- เพิ่ม config modules/navigation/permissions
- แยก shared API client
- แยก portfolio API composable
- แยก types ตาม domain
- คง route/API เดิมไว้

### Phase 2 — เพิ่ม domain ใหม่ใน frontend

- เพิ่ม types ใหม่ เช่น `types/shop.ts`
- เพิ่ม API composable เช่น `useShopApi.ts`
- เพิ่ม pages ใหม่ใต้ route namespace เช่น `pages/shop/products.vue`
- เพิ่มเมนูใน `config/navigation.ts`

### Phase 3 — Backend namespace

- เพิ่ม endpoint namespace สำหรับ domain ใหม่
- ยังไม่ต้องลบ endpoint เดิมของ Portfolio
- เพิ่ม backend handler/service/repository ตาม domain

### Phase 4 — Permission-based RBAC

- เพิ่ม permissions ใน user model หรือ JWT claims
- ปรับ frontend navigation/middleware ให้เช็ค permission ราย module
- ปรับ backend middleware ให้เช็ค permission ราย endpoint

### Phase 5 — Multi-tenant / Multi-site

- เพิ่ม site/workspace selector
- เพิ่ม `site_id`/`workspace_id` ใน API และ database schema
- แยกข้อมูลตาม tenant

---

## สรุปคำตอบเรื่อง API

- เว็บใหม่ในอนาคต **ไม่จำเป็นต้องใช้ API เส้นเดิมของ Portfolio**
- API เดิมสามารถเก็บไว้สำหรับ Portfolio ได้
- Users/Auth สามารถค่อยแก้ในโปรเจกต์ API ทีหลังได้
- สิ่งที่ควรทำตอนนี้คือแยก frontend architecture ให้ domain ใหม่ไม่ปนกับ Portfolio
- เมื่อเริ่มมีเว็บใหม่จริง ค่อยเพิ่ม backend namespace และ permission model
