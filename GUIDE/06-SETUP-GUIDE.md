# 06 — Setup & Development Guide (วิธีติดตั้งและพัฒนา)

เอกสารนี้อธิบายวิธี setup โปรเจกต์ตั้งแต่ clone จนถึงรัน development server พร้อมคำแนะนำสำหรับการพัฒนาต่อ

---

## สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

| Software | Minimum Version | ตรวจสอบด้วย |
|----------|----------------|------------|
| **Node.js** | 18.x | `node --version` |
| **npm** | 9.x | `npm --version` |
| **Git** | 2.x | `git --version` |

> Backend (Go API) จำเป็นต้องรันอยู่ที่ port 8080 เพื่อใช้งาน API จริง  
> แต่สามารถใช้ **Demo Mode** ได้โดยไม่ต้องมี Backend

---

## ขั้นตอนการ Setup

### 1. Clone โปรเจกต์

```bash
git clone <repository-url>
cd Website_Config
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
# คัดลอก .env.example เป็น .env
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# URL ของ Backend API (default: http://localhost:8080)
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

> ถ้า Backend รันที่ URL อื่น ให้เปลี่ยนค่านี้ตาม

### 4. รัน Development Server

```bash
npm run dev
```

Admin Panel จะเปิดที่ **http://localhost:3001**

### 5. เข้าใช้งาน

**ถ้ามี Backend:**
- เปิด http://localhost:3001
- Login ด้วย default credentials:
  - **Username:** `admin`
  - **Password:** `changeme123`
- (credentials ตั้งค่าได้ผ่าน environment variables ของ Backend)

**ถ้าไม่มี Backend (ทดลองใช้งาน):**
- เปิด http://localhost:3001
- กดปุ่ม **"Demo Mode"** ที่หน้า Login
- จะเข้าสู่ mock mode ที่ใช้ข้อมูลจำลองแทน

---

## คำสั่งที่มี (npm scripts)

| คำสั่ง | คำอธิบาย |
|--------|---------|
| `npm run dev` | เริ่ม development server (port 3001, hot-reload) |
| `npm run build` | Build สำหรับ production |
| `npm run generate` | Generate static HTML files |
| `npm run preview` | Preview production build |
| `npm run lint` | ตรวจ code style ด้วย ESLint |
| `npm run typecheck` | ตรวจ TypeScript types |

---

## โครงสร้างระบบ 3 โปรเจกต์

Admin Panel เป็น 1 ใน 3 โปรเจกต์ที่ทำงานร่วมกัน:

```
┌────────────────────────────────────────────────────────────┐
│                    Development Setup                        │
│                                                            │
│  Terminal 1:                                               │
│  ├── cd portfolio-site                                     │
│  └── npm run dev         → http://localhost:3000           │
│                                                            │
│  Terminal 2:                                               │
│  ├── cd Website_Config   (โปรเจกต์นี้)                      │
│  └── npm run dev         → http://localhost:3001           │
│                                                            │
│  Terminal 3:                                               │
│  ├── cd Admin_Website_Management  (Backend project)        │
│  └── go run main.go      → http://localhost:8080           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

> ไม่จำเป็นต้องรันทั้ง 3 พร้อมกัน  
> Admin Panel + Backend ก็เพียงพอสำหรับการจัดการเนื้อหา  
> หรือรัน Admin Panel ตัวเดียวใน Demo Mode ก็ได้

---

## คำแนะนำสำหรับการพัฒนาต่อ

### เพิ่มหน้าใหม่

1. สร้างไฟล์ `.vue` ใน `pages/` (Nuxt จะสร้าง route อัตโนมัติ)
2. เพิ่ม API methods ใน `composables/useAdminApi.ts`
3. เพิ่ม mock data ใน `composables/useMockData.ts`
4. เพิ่ม TypeScript types ใน `types/admin.ts`
5. เพิ่ม sidebar link ใน `components/AdminSidebar.vue` (พร้อม `minRole`)
6. เพิ่ม i18n keys ใน `i18n/locales/en.json` และ `th.json`
7. (ถ้าจำเป็น) เพิ่ม route guard ใน `middleware/auth.global.ts`

### เพิ่ม Component ใหม่

1. สร้างไฟล์ `.vue` ใน `components/` (Nuxt auto-import ให้)
2. ใช้ `<script setup lang="ts">` เสมอ
3. ใช้ `defineProps<T>()` และ `defineEmits<T>()` สำหรับ interface
4. Styling ใช้ Tailwind CSS utility classes เท่านั้น

### เพิ่มภาษาใหม่

1. สร้างไฟล์ locale ใหม่ใน `i18n/locales/` (เช่น `ja.json`)
2. เพิ่ม locale ใน `nuxt.config.ts` → `i18n.locales`
3. Import ไฟล์ใน `i18n/i18n.config.ts`
4. `LanguageSwitcher` จะแสดงภาษาใหม่อัตโนมัติ

### เพิ่ม API endpoint ใหม่

1. เพิ่ม method ใน `composables/useAdminApi.ts`
2. เพิ่ม mock handler ใน section mock mode ของ `useAdminApi.ts`
3. เพิ่ม mock data ใน `composables/useMockData.ts`
4. เพิ่ม TypeScript types สำหรับ request/response ใน `types/admin.ts`

---

## Coding Conventions

### Vue Components

- ใช้ `<script setup lang="ts">` เสมอ (Composition API)
- ห้ามใช้ Options API
- ตั้งชื่อ event handler ด้วย `handle` prefix: `handleSubmit`, `handleDelete`
- ใช้ `ref()` สำหรับ primitive, `reactive()` สำหรับ objects

### Styling

- ใช้ Tailwind CSS utility classes เท่านั้น
- ห้ามเขียน `<style>` blocks
- Color palette: `slate` (neutral), `indigo` (primary), `green` (success), `red` (danger)

### State Management

- ใช้ `ref()` / `reactive()` สำหรับ local state
- ใช้ `useState()` สำหรับ global state (auth)
- ไม่มี Pinia/Vuex ในโปรเจกต์นี้

### Error Handling

- แสดง error ผ่าน `Toast` component
- API errors ถูกจัดการใน `useAdminApi` (401 → logout, 403 → permission msg)
- `try/catch` ครอบทุก API call

### i18n

- ข้อความทุกตัวที่แสดงบน UI ต้องใช้ `$t('key')` หรือ `t('key')`
- ห้าม hardcode ข้อความในภาษาใดภาษาหนึ่ง
- เพิ่ม key ใน **ทั้ง** `en.json` และ `th.json` เสมอ

---

## Common Patterns

### CRUD Page Pattern

ทุกหน้า CRUD ใช้ pattern เดียวกัน:

```
1. onMounted → api.resource.list() → โหลดรายการ
2. Create form → api.resource.create(data) → เพิ่มรายการ
3. Edit button → โหลดข้อมูลลง form → api.resource.update(id, data)
4. Delete button → ConfirmDialog → api.resource.delete(id)
5. สำเร็จ → Toast success + โหลดรายการใหม่
6. ล้มเหลว → Toast error
```

### Toast Usage

```vue
<script setup lang="ts">
const toast = ref<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = { message, type }
}
</script>

<template>
  <Toast
    v-if="toast"
    :message="toast.message"
    :type="toast.type"
    @close="toast = null"
  />
</template>
```

### API Call Pattern

```vue
<script setup lang="ts">
const api = useAdminApi()
const items = ref<Skill[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    items.value = await api.skills.list()
  } catch (e) {
    showToast('Failed to load', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
```

---

## Troubleshooting

### Admin Panel ไม่สามารถเชื่อมต่อ Backend

```
✅ ตรวจว่า Backend รันอยู่: curl http://localhost:8080/api/v1/admin/site-settings
✅ ตรวจค่า NUXT_PUBLIC_API_BASE_URL ใน .env
✅ ตรวจว่า CORS เปิดอยู่ที่ Backend
💡 ใช้ Demo Mode แทนเพื่อทดลองใช้งาน
```

### หน้าว่างหลัง Login

```
✅ ตรวจ Console (F12) ว่ามี error อะไร
✅ ตรวจว่า JWT token format ถูกต้อง (decode ได้ทาง jwt.io)
✅ ตรวจว่า Backend ส่ง role ที่ถูกต้องใน JWT payload
```

### i18n ไม่ทำงาน / ข้อความไม่แสดง

```
✅ ตรวจว่าเพิ่ม key ใน en.json และ th.json แล้ว
✅ ตรวจ console ว่ามี missing translation warning
✅ ตรวจว่า key path ถูกต้อง (nested structure)
```

### TypeScript Errors

```bash
# ตรวจ type errors ทั้งโปรเจกต์
npm run typecheck

# ลอง regenerate types
npx nuxi prepare
```

### Dependencies Issues

```bash
# ลบ node_modules แล้วติดตั้งใหม่
rm -rf node_modules .nuxt
npm install
npx nuxi prepare
```

---

## Build สำหรับ Production

```bash
# Build
npm run build

# Preview locally
npm run preview

# หรือ Generate static files
npm run generate
```

Output จะอยู่ใน `.output/` directory พร้อม deploy ไปที่ hosting ที่รองรับ Node.js หรือ static hosting

---

## ข้อมูลเพิ่มเติม

| เอกสาร | คำอธิบาย |
|--------|---------|
| [01-SYSTEM-FLOW.md](./01-SYSTEM-FLOW.md) | Flow การทำงานของระบบ |
| [02-FILE-REFERENCE.md](./02-FILE-REFERENCE.md) | รายละเอียดไฟล์ทุกตัว |
| [03-TECH-STACK.md](./03-TECH-STACK.md) | Tech Stack ที่ใช้ |
| [04-API-REFERENCE.md](./04-API-REFERENCE.md) | API Endpoints ทั้งหมด |
| [05-AUTHENTICATION-RBAC.md](./05-AUTHENTICATION-RBAC.md) | ระบบ Auth & RBAC |
| [07-MULTI-SITE-ARCHITECTURE.md](./07-MULTI-SITE-ARCHITECTURE.md) | แนวทางปรับเป็น Admin หลายเว็บไซต์ |
| [README.md](../README.md) | README เดิมของโปรเจกต์ |
| [RBAC_BACKEND_CHANGES.md](../RBAC_BACKEND_CHANGES.md) | รายละเอียดการแก้ไข Backend สำหรับ RBAC |
| [Nuxt 3 Documentation](https://nuxt.com/docs) | เอกสาร Nuxt 3 อย่างเป็นทางการ |
| [Vue 3 Documentation](https://vuejs.org/guide/introduction.html) | เอกสาร Vue 3 |
| [Tailwind CSS Documentation](https://tailwindcss.com/docs) | เอกสาร Tailwind CSS |
