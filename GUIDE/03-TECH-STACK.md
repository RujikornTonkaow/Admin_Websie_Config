# 03 — Tech Stack (เทคโนโลยีที่ใช้)

เอกสารนี้ระบุ Tech Stack ทั้งหมดที่โปรเจกต์นี้ใช้ พร้อมอธิบายว่าแต่ละตัวทำหน้าที่อะไร

---

## สรุปภาพรวม

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (โปรเจกต์นี้)                    │
│                                                              │
│   Framework:    Nuxt 3 + Vue 3 (Composition API)             │
│   Language:     TypeScript                                   │
│   Styling:      Tailwind CSS                                 │
│   Icons:        Iconify (ผ่าน @nuxt/icon)                    │
│   i18n:         @nuxtjs/i18n (English + Thai)                │
│   Rendering:    SPA (Client-Side Only, SSR ปิด)               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                      Backend (โปรเจกต์แยก)                    │
│                                                              │
│   Language:     Go (Golang)                                  │
│   API Style:    REST API                                     │
│   Database:     MongoDB                                      │
│   Auth:         JWT (JSON Web Token)                         │
│   Port:         8080                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Dependencies

### Production Dependencies

| Package | Version | หน้าที่ |
|---------|---------|--------|
| `nuxt` | ^3.15.0 | Meta-framework หลักของ Vue 3 รวม routing, auto-imports, build system |
| `vue` | ^3.5.0 | UI framework สำหรับสร้าง reactive components |
| `vue-router` | ^4.5.0 | Client-side routing (Nuxt จัดการให้อัตโนมัติผ่าน file-based routing) |
| `@nuxtjs/i18n` | ^10.2.4 | Internationalization module รองรับหลายภาษา (EN/TH) |

### Dev Dependencies

| Package | Version | หน้าที่ |
|---------|---------|--------|
| `@nuxtjs/tailwindcss` | ^6.12.0 | Nuxt module สำหรับ Tailwind CSS integration |
| `@nuxt/icon` | ^1.12.0 | Nuxt module สำหรับใช้ Iconify icons ผ่าน `<Icon>` component |
| `@nuxt/eslint` | ^0.7.0 | ESLint configuration สำหรับ Nuxt |
| `typescript` | ^5.8.0 | TypeScript compiler |
| `@types/node` | ^25.6.0 | Type definitions สำหรับ Node.js APIs |

---

## รายละเอียดแต่ละ Technology

### 1. Nuxt 3

**บทบาท:** Meta-framework หลัก

Nuxt 3 เป็น framework ที่สร้างบน Vue 3 ให้ความสามารถเพิ่มเติม:

- **File-based routing** — ไฟล์ใน `pages/` กลายเป็น route อัตโนมัติ
- **Auto-imports** — Vue APIs (`ref`, `computed`, `watch`), composables, components ไม่ต้อง import เอง
- **Layouts** — ระบบ layout สำหรับ share UI structure ระหว่าง pages
- **Middleware** — Route guards สำหรับตรวจสอบสิทธิ์
- **Runtime Config** — จัดการ environment variables อย่างปลอดภัย (`useRuntimeConfig()`)

**การใช้งานในโปรเจกต์:**
- ตั้งค่า `ssr: false` → ทำงานเป็น SPA (Single Page Application)
- dev server รันที่ port 3001
- ใช้ `runtimeConfig.public.apiBaseUrl` สำหรับ Backend URL

### 2. Vue 3 (Composition API)

**บทบาท:** UI Framework

- ใช้ `<script setup lang="ts">` ในทุก component (ตาม Composition API pattern)
- ใช้ `ref()`, `reactive()`, `computed()`, `watch()` สำหรับ reactivity
- ใช้ `onMounted()`, `onUnmounted()` สำหรับ lifecycle
- ใช้ `defineProps<T>()`, `defineEmits<T>()` สำหรับ component interface

### 3. TypeScript

**บทบาท:** Type Safety

- ทุกไฟล์ `.vue` ใช้ `<script setup lang="ts">`
- Types/interfaces อยู่ใน `types/admin.ts`
- Composables มี type annotations ครบถ้วน
- `tsconfig.json` extends จาก Nuxt generated config

**Types หลักที่กำหนดไว้:**

```typescript
// Entity types
SiteSettings, Hero, About, Skill, Project,
Experience, SocialLink, ContactMessage, User

// Utility types
UserRole = 'admin' | 'user_account' | 'visitor'
ApiEnvelope<T> = { data: T; error?: string; meta?: object }
SidebarLink = { label: string; to: string; icon: string; minRole?: UserRole }
```

### 4. Tailwind CSS

**บทบาท:** Utility-first CSS framework

- ใช้ utility classes โดยตรงใน template (ไม่มี `<style>` blocks)
- Font: **Inter** (Google Fonts) ตั้งเป็น default sans-serif
- ใช้ responsive design ผ่าน breakpoints (`sm:`, `md:`, `lg:`)
- Color palette หลัก: `slate`, `indigo`, `blue`, `green`, `red`

**ตัวอย่างการใช้:**

```html
<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  <h2 class="text-lg font-semibold text-slate-800">Title</h2>
  <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
    Save
  </button>
</div>
```

### 5. Iconify (ผ่าน @nuxt/icon)

**บทบาท:** Icon system ขนาดใหญ่

- ใช้ `<Icon name="mdi:icon-name" />` ในทุก component
- เข้าถึง icon sets ทั้งหมดของ Iconify (Material Design Icons, Heroicons, etc.)
- Icon ถูก render เป็น SVG อัตโนมัติ

**ตัวอย่าง icon ที่ใช้:**

```html
<Icon name="mdi:view-dashboard" />       <!-- Dashboard -->
<Icon name="mdi:cog" />                 <!-- Settings -->
<Icon name="mdi:account-group" />        <!-- Users -->
<Icon name="mdi:logout" />              <!-- Logout -->
```

### 6. @nuxtjs/i18n

**บทบาท:** Internationalization (หลายภาษา)

- รองรับ 2 ภาษา: English (`en`) และ Thai (`th`)
- Strategy: `no_prefix` (URL ไม่เปลี่ยนตามภาษา)
- ตรวจจับภาษาจาก browser และเก็บลง cookie (`i18n_locale`)
- ใช้ `$t('key')` หรือ `const { t } = useI18n()` ในทุก component

**โครงสร้าง locale file:**

```json
{
  "common": { "save": "Save", "cancel": "Cancel", "delete": "Delete" },
  "nav": { "dashboard": "Dashboard", "skills": "Skills" },
  "login": { "title": "Admin Login", "username": "Username" },
  "dashboard": { "title": "Dashboard", "totalSkills": "Total Skills" }
}
```

### 7. Vue I18n

**บทบาท:** Vue plugin สำหรับ i18n (ใช้โดย @nuxtjs/i18n)

- ตั้งค่าใน `i18n/i18n.config.ts`
- `legacy: false` (ใช้ Composition API mode)
- Fallback locale: `en`

---

## Backend Tech Stack (โปรเจกต์แยก — ไม่รวมในโปรเจกต์นี้)

Backend เป็นโปรเจกต์แยกที่เขียนด้วย Go ข้อมูลด้านล่างเป็นสิ่งที่ Admin Panel คาดหวังจาก Backend:

| Technology | หน้าที่ |
|------------|--------|
| **Go (Golang)** | ภาษาหลักของ Backend |
| **REST API** | รูปแบบ API ที่ Backend ให้บริการ |
| **MongoDB** | ฐานข้อมูลหลัก |
| **JWT** | Authentication token format |
| **Port 8080** | Port ที่ Backend รันอยู่ (default) |

**Backend API response format:**

```json
{
  "data": { ... },
  "error": "error message (ถ้ามี)",
  "meta": {
    "total": 10,
    "unread_count": 3
  }
}
```

---

## Development Tools

| Tool | หน้าที่ |
|------|--------|
| **Node.js** | Runtime สำหรับรัน Nuxt dev server |
| **npm** | Package manager |
| **ESLint** | Linter สำหรับตรวจ code quality |
| **Nuxt DevTools** | เปิดใช้งานใน `nuxt.config.ts` สำหรับ debug |

---

## Port Summary

| Service | Port | คำอธิบาย |
|---------|------|---------|
| Portfolio Site (public) | 3000 | เว็บไซต์ Portfolio ที่ผู้เข้าชมเห็น |
| **Admin Panel (โปรเจกต์นี้)** | **3001** | Admin Panel สำหรับจัดการเนื้อหา |
| Go Backend API | 8080 | REST API + Authentication |

---

## Version Requirements

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 18.x หรือสูงกว่า |
| npm | 9.x หรือสูงกว่า |
| Go Backend | รันอยู่ที่ port 8080 (หรือตั้งค่าผ่าน `.env`) |
