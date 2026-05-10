# 04 — API Reference (เอกสาร API ทั้งหมด)

เอกสารนี้ระบุ API endpoints ทั้งหมดที่ Admin Panel ใช้เรียกไปยัง Go Backend รวมถึง request/response format

---

## Multi-site Cutover Notice

Portfolio CRUD API เปลี่ยนเป็น site-scoped routes แบบใหม่ทั้งหมดแล้ว และไม่รองรับ legacy Portfolio admin routes เดิม

รูปแบบใหม่:

```text
/api/v1/admin/sites/:siteId/portfolio/...
```

`Website_Config` ต้องโหลด `GET /api/v1/admin/sites` ก่อน แล้วตั้ง `selectedSiteId` ผ่าน `useSiteContext.ts` ก่อนเรียก Portfolio API ทุกครั้ง ดูรายละเอียดเต็มใน `GUIDE/07-MULTI-SITE-ARCHITECTURE.md`

---

## Base URL

```
Default: http://localhost:8080
ตั้งค่าผ่าน: NUXT_PUBLIC_API_BASE_URL ใน .env
```

Admin endpoints ใช้ prefix `/api/v1/admin/` ส่วน Portfolio CRUD ใช้ path แบบ site-scoped: `/api/v1/admin/sites/{siteId}/portfolio/...`

---

## Response Format (ApiEnvelope)

ทุก response จาก Backend ใช้ format เดียวกัน:

```json
{
  "data": { ... },
  "error": "error message (ถ้ามี error)",
  "meta": {
    "total": 10,
    "unread_count": 3
  }
}
```

| Field | Type | คำอธิบาย |
|-------|------|---------|
| `data` | `T` | ข้อมูลหลักที่ต้องการ |
| `error` | `string?` | ข้อความ error (มีเมื่อ request ล้มเหลว) |
| `meta` | `object?` | ข้อมูลเพิ่มเติม เช่น pagination, counts |

---

## HTTP Status Codes ที่ใช้

| Status | ความหมาย | การจัดการใน Admin Panel |
|--------|---------|----------------------|
| 200 | สำเร็จ | แสดง data ปกติ |
| 201 | สร้างสำเร็จ | แสดง Toast success |
| 401 | ไม่ได้ login / token หมดอายุ | **Auto logout** → redirect `/login` |
| 403 | ไม่มีสิทธิ์ | แสดงข้อความ permission error |
| 404 | ไม่พบข้อมูล | แสดง error message |
| 500 | Server error | แสดง error message |

---

## Authentication

### POST `/api/v1/admin/auth/login`

Login เพื่อรับ JWT token

**Request:**

```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response (200):**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64a1b2c3d4e5f6789012abcd",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

> Admin Panel ใช้ `token` จาก response แล้ว decode JWT payload เพื่อดึง role และ user ID

**JWT Payload ที่ decode ได้:**

```json
{
  "sub": "user-id-string",
  "role": "admin",
  "exp": 1234567890
}
```

**ใช้ในไฟล์:** `composables/useAuth.ts`

---

## Authorization Header

ทุก request (ยกเว้น login) ต้องส่ง header:

```
Authorization: Bearer <jwt-token>
```

---

## Site Settings

### GET `/api/v1/admin/sites/{siteId}/portfolio/site-settings`

ดึงการตั้งค่าเว็บไซต์

**Response:**

```json
{
  "data": {
    "id": "abc123",
    "site_title": "My Portfolio",
    "page_title": "Home | My Portfolio",
    "meta_description": "Full-stack developer portfolio",
    "footer_tagline": "Built with passion",
    "default_theme": "midnight",
    "profile_image": "/uploads/profile.jpg",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**`default_theme` values:** `midnight`, `sunshine`

### PUT `/api/v1/admin/sites/{siteId}/portfolio/site-settings`

อัพเดตการตั้งค่าเว็บไซต์

**Request:** (เหมือน response data ด้านบน)

**ใช้ในหน้า:** `pages/site-settings.vue`

---

## Hero Section

### GET `/api/v1/admin/sites/{siteId}/portfolio/hero`

ดึงข้อมูล hero section

**Response:**

```json
{
  "data": {
    "id": "abc123",
    "greeting": "Hello, I'm",
    "full_name": "John Doe",
    "subtitle": "Full-stack Developer",
    "cta_primary_text": "View Projects",
    "cta_primary_link": "#projects",
    "cta_secondary_text": "Contact Me",
    "cta_secondary_link": "#contact",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT `/api/v1/admin/sites/{siteId}/portfolio/hero`

อัพเดต hero section

**ใช้ในหน้า:** `pages/hero.vue`

---

## About Section

### GET `/api/v1/admin/sites/{siteId}/portfolio/about`

ดึงข้อมูล about section

**Response:**

```json
{
  "data": {
    "id": "abc123",
    "title": "About Me",
    "bio_paragraphs": ["paragraph 1", "paragraph 2"],
    "personality_tags": ["Creative", "Detail-oriented"],
    "stats": [
      { "value": "5+", "label": "Years Experience" },
      { "value": "50+", "label": "Projects Completed" }
    ],
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT `/api/v1/admin/sites/{siteId}/portfolio/about`

อัพเดต about section

**ใช้ในหน้า:** `pages/about.vue`

---

## Skills

### GET `/api/v1/admin/sites/{siteId}/portfolio/skills`

ดึงรายการ skills ทั้งหมด

**Response:**

```json
{
  "data": [
    {
      "id": "abc123",
      "name": "Vue.js",
      "icon": "mdi:vuejs",
      "category": "frontend",
      "sort_order": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/v1/admin/sites/{siteId}/portfolio/skills`

สร้าง skill ใหม่

**Request:**

```json
{
  "name": "React",
  "icon": "mdi:react",
  "category": "frontend"
}
```

**Category values:** `frontend`, `backend`, `devops`, `tools`

### PUT `/api/v1/admin/sites/{siteId}/portfolio/skills/:id`

อัพเดต skill

### DELETE `/api/v1/admin/sites/{siteId}/portfolio/skills/:id`

ลบ skill

**ใช้ในหน้า:** `pages/skills.vue`

---

## Projects

### GET `/api/v1/admin/sites/{siteId}/portfolio/projects`

ดึงรายการ projects ทั้งหมด

**Response:**

```json
{
  "data": [
    {
      "id": "abc123",
      "title": "Portfolio Website",
      "description": "My personal portfolio",
      "image": "/uploads/project1.jpg",
      "tags": ["Vue.js", "Tailwind CSS"],
      "live_url": "https://example.com",
      "source_url": "https://github.com/user/repo",
      "sort_order": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/v1/admin/sites/{siteId}/portfolio/projects`

สร้าง project ใหม่

### PUT `/api/v1/admin/sites/{siteId}/portfolio/projects/:id`

อัพเดต project

### DELETE `/api/v1/admin/sites/{siteId}/portfolio/projects/:id`

ลบ project

### PUT `/api/v1/admin/sites/{siteId}/portfolio/projects/reorder`

เรียงลำดับ projects ใหม่

**Request:**

```json
{
  "ids": ["id1", "id2", "id3"]
}
```

**ใช้ในหน้า:** `pages/projects.vue`

---

## Experiences

### GET `/api/v1/admin/sites/{siteId}/portfolio/experiences`

ดึงรายการ experiences ทั้งหมด

**Response:**

```json
{
  "data": [
    {
      "id": "abc123",
      "role": "Senior Developer",
      "company": "Tech Corp",
      "period": "2022 - Present",
      "description": "Led the backend team for core services",
      "highlights": ["Led team of 5", "Built microservices"],
      "sort_order": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/v1/admin/sites/{siteId}/portfolio/experiences`

สร้าง experience ใหม่

### PUT `/api/v1/admin/sites/{siteId}/portfolio/experiences/:id`

อัพเดต experience

### DELETE `/api/v1/admin/sites/{siteId}/portfolio/experiences/:id`

ลบ experience

### PUT `/api/v1/admin/sites/{siteId}/portfolio/experiences/reorder`

เรียงลำดับ experiences ใหม่

**Request:**

```json
{
  "ids": ["id1", "id2", "id3"]
}
```

**ใช้ในหน้า:** `pages/experiences.vue`

---

## Social Links

### GET `/api/v1/admin/sites/{siteId}/portfolio/social-links`

ดึงรายการ social links ทั้งหมด

**Response:**

```json
{
  "data": [
    {
      "id": "abc123",
      "name": "GitHub",
      "url": "https://github.com/username",
      "icon": "mdi:github",
      "sort_order": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/v1/admin/sites/{siteId}/portfolio/social-links`

สร้าง social link ใหม่

### PUT `/api/v1/admin/sites/{siteId}/portfolio/social-links/:id`

อัพเดต social link

### DELETE `/api/v1/admin/sites/{siteId}/portfolio/social-links/:id`

ลบ social link

**ใช้ในหน้า:** `pages/social-links.vue`

---

## Contact Messages

### GET `/api/v1/admin/sites/{siteId}/portfolio/contacts`

ดึงรายการข้อความทั้งหมด

**Response:**

```json
{
  "data": [
    {
      "id": "abc123",
      "name": "John Viewer",
      "email": "john@example.com",
      "subject": "Job Inquiry",
      "message": "I'd like to discuss...",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "unread_count": 3
  }
}
```

### GET `/api/v1/admin/sites/{siteId}/portfolio/contacts/:id`

ดึงรายละเอียดข้อความเดียว

### DELETE `/api/v1/admin/sites/{siteId}/portfolio/contacts/:id`

ลบข้อความ (editor ขึ้นไป)

**ใช้ในหน้า:** `pages/contacts.vue`

---

## Users (`admin+`)

### GET `/api/v1/admin/users`

ดึงรายการ users ที่ผู้ใช้ปัจจุบันมีสิทธิ์เห็น

**Response:**

```json
{
  "data": [
    {
      "id": "abc123",
      "username": "admin",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/v1/admin/users`

สร้าง user ใหม่

**Request:**

```json
{
  "username": "newuser",
  "password": "secure-password",
  "role": "editor"
}
```

### GET `/api/v1/admin/users/:id`

ดึงข้อมูล user เดียว

### PUT `/api/v1/admin/users/:id`

อัพเดต user (username, role)

**Request:**

```json
{
  "username": "updated-name",
  "role": "admin"
}
```

### PUT `/api/v1/admin/users/:id/password`

เปลี่ยน password ของ user

**Request:**

```json
{
  "new_password": "new-secure-password"
}
```

### DELETE `/api/v1/admin/users/:id`

ลบ user (ห้ามลบตัวเอง)

### GET `/api/v1/admin/users/:id/memberships`

ดึง site access ของ user

### PUT `/api/v1/admin/users/:id/memberships`

อัพเดต site access ของ user โดยส่งเฉพาะ `site_id`

```json
{
  "memberships": [
    { "site_id": "site-object-id" }
  ]
}
```

**ใช้ในหน้า:** `pages/users.vue`

---

## Sites

### GET `/api/v1/admin/sites`

ดึง site ที่ user ปัจจุบันเข้าถึงได้; `super_admin` จะเห็นทุก site

### POST `/api/v1/admin/sites`

สร้าง site ใหม่ ใช้ได้เฉพาะ `super_admin`

```json
{
  "name": "Portfolio B",
  "slug": "portfolio-b",
  "type": "portfolio",
  "domains": ["portfolio-nu-gray-57.vercel.app"]
}
```

### PUT `/api/v1/admin/sites/:siteId`

แก้ site metadata เช่น `name`, `slug`, `domains`

### DELETE `/api/v1/admin/sites/:siteId`

ลบ site

**ใช้ในหน้า:** `pages/sites.vue`

---

## File Upload

### POST `/api/v1/admin/sites/{siteId}/portfolio/upload`

อัพโหลดไฟล์รูปภาพ

**Request:** `multipart/form-data`

| Field | Type | คำอธิบาย |
|-------|------|---------|
| `file` | File | ไฟล์รูปภาพ (image/*) ขนาดไม่เกิน 5MB |

**Response:**

```json
{
  "data": {
    "url": "/uploads/filename.jpg",
    "filename": "filename.jpg"
  }
}
```

**Preview URL:** `{apiBaseUrl}{url}` (เช่น `http://localhost:8080/uploads/filename.jpg`)

**ใช้ใน component:** `components/FormImageUpload.vue`

---

## สรุป API Endpoints ทั้งหมด

| Method | Endpoint | หน้าที่ | สิทธิ์ |
|--------|----------|--------|-------|
| POST | `/api/v1/admin/auth/login` | Login | Public |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/site-settings` | ดึง site settings | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/site-settings` | อัพเดต site settings | Editor+ |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/hero` | ดึง hero | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/hero` | อัพเดต hero | Editor+ |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/about` | ดึง about | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/about` | อัพเดต about | Editor+ |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/skills` | ดึง skills | Editor+ |
| POST | `/api/v1/admin/sites/{siteId}/portfolio/skills` | สร้าง skill | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/skills/:id` | อัพเดต skill | Editor+ |
| DELETE | `/api/v1/admin/sites/{siteId}/portfolio/skills/:id` | ลบ skill | Editor+ |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/projects` | ดึง projects | Editor+ |
| POST | `/api/v1/admin/sites/{siteId}/portfolio/projects` | สร้าง project | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/projects/:id` | อัพเดต project | Editor+ |
| DELETE | `/api/v1/admin/sites/{siteId}/portfolio/projects/:id` | ลบ project | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/projects/reorder` | เรียงลำดับ projects | Editor+ |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/experiences` | ดึง experiences | Editor+ |
| POST | `/api/v1/admin/sites/{siteId}/portfolio/experiences` | สร้าง experience | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/experiences/:id` | อัพเดต experience | Editor+ |
| DELETE | `/api/v1/admin/sites/{siteId}/portfolio/experiences/:id` | ลบ experience | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/experiences/reorder` | เรียงลำดับ experiences | Editor+ |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/social-links` | ดึง social links | Editor+ |
| POST | `/api/v1/admin/sites/{siteId}/portfolio/social-links` | สร้าง social link | Editor+ |
| PUT | `/api/v1/admin/sites/{siteId}/portfolio/social-links/:id` | อัพเดต social link | Editor+ |
| DELETE | `/api/v1/admin/sites/{siteId}/portfolio/social-links/:id` | ลบ social link | Editor+ |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/contacts` | ดึง contacts | All roles |
| GET | `/api/v1/admin/sites/{siteId}/portfolio/contacts/:id` | ดึง contact เดียว | All roles |
| DELETE | `/api/v1/admin/sites/{siteId}/portfolio/contacts/:id` | ลบ contact | Editor+ |
| POST | `/api/v1/admin/sites/{siteId}/portfolio/upload` | อัพโหลดไฟล์ | Editor+ |
| GET | `/api/v1/admin/users` | ดึง users | Admin |
| POST | `/api/v1/admin/users` | สร้าง user | Admin |
| GET | `/api/v1/admin/users/:id` | ดึง user เดียว | Admin |
| PUT | `/api/v1/admin/users/:id` | อัพเดต user | Admin |
| DELETE | `/api/v1/admin/users/:id` | ลบ user | Admin |
| PUT | `/api/v1/admin/users/:id/password` | เปลี่ยน password | Admin |