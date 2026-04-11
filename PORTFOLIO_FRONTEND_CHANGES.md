# Portfolio Frontend — Required Changes Summary

เอกสารนี้เป็นสรุปสั้นๆ ของสิ่งที่ต้องเปลี่ยนแปลงใน **Portfolio Frontend** 
เอกสาร migration ฉบับเต็มอยู่ที่: `Admin_Website_Management/PORTFOLIO_FRONTEND_MIGRATION.md`

---

## สถานะปัจจุบัน

Portfolio Frontend ยังใช้ข้อมูล **hardcode** ใน `composables/usePortfolioData.ts`
ต้องเปลี่ยนให้ดึงข้อมูลจาก Backend API แทน

---

## สรุปการเปลี่ยนแปลง (10 ไฟล์)

| # | ไฟล์ | การเปลี่ยนแปลง | ความยาก |
|---|------|----------------|---------|
| 1 | `nuxt.config.ts` | เพิ่ม `runtimeConfig.public.apiBaseUrl` | ง่าย |
| 2 | `.env` | สร้างไฟล์ใหม่ ระบุ `NUXT_PUBLIC_API_BASE_URL` | ง่าย |
| 3 | `composables/usePortfolioData.ts` | **เปลี่ยนทั้งหมด** — ลบ hardcode, ใช้ `useFetch` จาก API | ยาก |
| 4 | `composables/useTheme.ts` | อ่าน `default_theme` จาก API แทน hardcode | ง่าย |
| 5 | `components/SectionHero.vue` | ใช้ข้อมูลจาก `usePortfolioData()` แทน hardcode | ปานกลาง |
| 6 | `components/SectionAbout.vue` | ใช้ข้อมูลจาก `usePortfolioData()` แทน hardcode | ปานกลาง |
| 7 | `components/SectionContact.vue` | เพิ่ม `$fetch` POST ไปยัง API | ปานกลาง |
| 8 | `components/TheNavbar.vue` | ดึง nav items + site title จาก API | ง่าย |
| 9 | `components/TheFooter.vue` | ดึง brand + tagline จาก API | ง่าย |
| 10 | `pages/index.vue` | ใช้ SEO metadata จาก API | ง่าย |

### Field Naming Convention

API response ใช้ **snake_case** ดังนั้น component ที่เคยใช้ camelCase ต้องเปลี่ยน:

| เดิม (camelCase) | ใหม่ (snake_case) |
|-------------------|-------------------|
| `liveUrl` | `live_url` |
| `sourceUrl` | `source_url` |
| `sortOrder` | `sort_order` |

### รูปภาพ

รูปภาพที่จัดการผ่าน Admin Panel จะถูก serve ที่:
```
{API_BASE_URL}/uploads/{filename}
```

ต้อง prefix path ของรูปด้วย API base URL:
```typescript
const imageUrl = `${config.public.apiBaseUrl}${data.profile_image}`
```

---

## ลำดับการทำงานที่แนะนำ

1. **เพิ่ม API config** — `nuxt.config.ts` + `.env`
2. **แก้ `usePortfolioData.ts`** — เปลี่ยนเป็น fetch จาก API
3. **แก้ components ทีละตัว** — Hero → About → Contact → Navbar → Footer
4. **แก้ `useTheme.ts`** — ใช้ default theme จาก API
5. **แก้ `pages/index.vue`** — SEO metadata
6. **ทดสอบทุก section** — ตรวจสอบว่าข้อมูลแสดงถูกต้อง

---

> รายละเอียดเต็มพร้อมโค้ดตัวอย่าง ดูที่: `Admin_Website_Management/PORTFOLIO_FRONTEND_MIGRATION.md`
