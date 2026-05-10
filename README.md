# Website Config Admin Dashboard

Nuxt 3 admin dashboard สำหรับจัดการหลายเว็บไซต์ผ่าน backend เดียว โดยทุกข้อมูล portfolio ถูก scope ด้วย `siteId`

## System Overview

| Project | Default Port | หน้าที่ |
|---------|--------------|--------|
| `Portfolio` | 3000+ | เว็บ public portfolio หลาย domain |
| `Admin_Website_Management` | 8080 | Go REST API + MongoDB |
| `Website_Config` | 3001 | Admin dashboard สำหรับจัดการ sites, users และ content |

## Current Architecture

- Admin dashboard โหลด site ที่ user มีสิทธิ์จาก `GET /api/v1/admin/sites`
- Portfolio content ใช้ site-scoped routes เช่น `/api/v1/admin/sites/{siteId}/portfolio/projects`
- Sidebar แสดง portfolio menu แยกตาม site ที่ user เข้าถึงได้
- Shop/Finance menu จะแสดงเมื่อ backend มี site type นั้นจริง
- `super_admin` จัดการ site ได้ที่หน้า `/sites`

## Roles

| Role | สิทธิ์ |
|------|--------|
| `super_admin` | เห็นทุก site, จัดการ sites/users ทุกคน, สร้าง `super_admin` ได้ |
| `admin` | จัดการ content และ users เฉพาะ site ที่ได้รับ access |
| `editor` | แก้ content เฉพาะ site ที่ได้รับ access |
| `viewer` | ดู Dashboard/Contacts เฉพาะ site ที่ได้รับ access |

`site_members` เป็น access list ไม่ใช่ per-site role ใน UI

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

ตั้งค่า `.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Important Pages

| Page | Access |
|------|--------|
| `/` | ทุก role |
| `/contacts` | ทุก role |
| `/site-settings`, `/hero`, `/about`, `/skills`, `/projects`, `/experiences`, `/social-links` | `editor+` |
| `/users` | `admin+` |
| `/sites` | `super_admin` |

## Docs

อ่านรายละเอียดเพิ่มเติมใน `GUIDE/`:

- `01-SYSTEM-FLOW.md`
- `04-API-REFERENCE.md`
- `05-AUTHENTICATION-RBAC.md`
- `07-MULTI-SITE-ARCHITECTURE.md`
- `08-CORS-AND-LOCAL-DEV.md`
