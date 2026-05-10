# 08 — CORS & Local Development

เอกสารนี้อธิบายการตั้งค่า API base URL และ CORS สำหรับ Admin Dashboard, Backend และ Portfolio หลาย domain

---

## โปรเจกต์ที่ต้องอ่าน

- `Website_Config` — ตั้งค่า `NUXT_PUBLIC_API_BASE_URL`
- `Admin_Website_Management` — ตั้งค่า CORS และ dynamic domain cache
- `Portfolio` — ตั้งค่า API base URL ให้ชี้ backend ที่ถูกต้อง

---

## Admin Dashboard

Admin Dashboard เรียก backend ตรงผ่าน runtime config:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Production ให้ชี้ไป backend จริง เช่น:

```env
NUXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

ถ้า env ว่างหรือผิด frontend จะยิง API ผิดที่ และอาจทำให้ login/site list ไม่ตรงกับ backend ที่ต้องการ

---

## Backend CORS

Backend ใช้ env:

```env
ALLOWED_ORIGINS=https://admin-websie-config.vercel.app,http://localhost:3001
```

ให้ใส่ origin แบบเต็มพร้อม protocol และคั่นด้วย comma

`ALLOWED_ORIGINS` ควรใส่เฉพาะ origin แบบ static เช่น:

- Admin Dashboard production
- Admin Dashboard local dev
- origin อื่นที่ไม่อยู่ใน collection `sites`

---

## Portfolio Domains

Portfolio domains ไม่ควรต้องเพิ่มทีละตัวใน Render env ถ้าเป็น site ที่สร้างผ่านระบบหลังบ้าน

Backend มี `DomainCache` ที่โหลด domains จาก database:

```text
sites.domains
```

ดังนั้นการเพิ่ม portfolio เว็บใหม่ควรทำที่หน้า `Site Management`:

```text
name: Portfolio B
slug: portfolio-b
type: portfolio
domains: portfolio-b.example.com
```

หรือ local:

```text
domains: localhost:3002
```

อย่าใส่ `https://` ใน `sites.domains` ให้ใส่เฉพาะ host เช่น `portfolio-nu-gray-57.vercel.app`

---

## Domain Cache

Backend refresh domains จาก DB เป็นระยะ

- ถ้าเพิ่งสร้าง site ใหม่แล้ว portfolio domain ยัง CORS/resolve ไม่ผ่าน ให้รอ cache refresh หรือ restart backend
- ถ้า deploy บน Render การ restart service จะโหลด cache ใหม่ทันที

---

## Local Multi-Site Testing

สามารถรัน Portfolio โปรเจกต์เดียวหลาย port ได้ เช่น:

```text
localhost:3000
localhost:3002
localhost:3003
```

แล้วสร้าง site ใน backend local:

```text
Site A domains: localhost:3000
Site B domains: localhost:3002
Site C domains: localhost:3003
```

ทุก instance ต้องชี้ `NUXT_PUBLIC_API_BASE_URL` ไป backend local ตัวเดียวกัน

---

## Vercel Testing Without Custom Domain

ถ้าไม่มี domain ของตัวเองและต้องการ `.vercel.app` ฟรีหลายชื่อ ต้องสร้าง Vercel project เพิ่มจาก repo เดิม

ตัวอย่าง:

```text
protfolio-five-pi.vercel.app
portfolio-nu-gray-57.vercel.app
```

แต่ละ Vercel project ต้องตั้ง env `NUXT_PUBLIC_API_BASE_URL` ให้ชี้ backend prod ตัวเดียวกัน และใน `Site Management` ต้องสร้าง site ที่ `domains` ตรงกับ host ของแต่ละ project

---

## Checklist

- Admin Dashboard env ชี้ backend ที่ถูกต้อง
- Portfolio env ชี้ backend ที่ถูกต้อง
- Backend `ALLOWED_ORIGINS` มี admin origin
- Portfolio domain ถูกเพิ่มใน `Site Management`
- `sites.domains` ไม่มี `https://` และไม่มี trailing slash
- หลังเพิ่ม domain ใหม่ รอ cache refresh หรือ restart backend
