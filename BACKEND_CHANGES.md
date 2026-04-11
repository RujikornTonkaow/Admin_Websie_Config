# Backend (Admin_Website_Management) — Required Changes

เอกสารนี้อธิบายสิ่งที่ต้องตรวจสอบและเปลี่ยนแปลงในโปรเจกต์ **Admin_Website_Management** (Go Backend)
เพื่อให้ทำงานร่วมกับ Admin Panel (Website_Config) ได้อย่างสมบูรณ์

---

## 1. CORS Configuration

### สถานะปัจจุบัน: ✅ พร้อมแล้ว

`.env.example` มีค่า `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001` อยู่แล้ว
ซึ่งรองรับทั้ง Portfolio Frontend (port 3000) และ Admin Panel (port 3001)

**ข้อควรระวัง:** Admin Panel ตั้ง dev port ไว้ที่ 3001 แต่ถ้า port 3001 ถูกใช้อยู่ Nuxt จะ fallback ไป port อื่น (เช่น 3002)
ซึ่งจะทำให้ CORS block ทุก request จากเบราว์เซอร์

**วิธีแก้ (เลือกอย่างหนึ่ง):**
1. ตรวจสอบว่า port 3001 ว่างก่อนรัน Admin Panel
2. หรือเพิ่ม fallback port ใน `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 2. Upload Directory

### สถานะปัจจุบัน: ✅ พร้อมแล้ว

Backend รองรับ file upload ผ่าน `POST /api/v1/admin/upload` แล้ว
และ serve static files ที่ `/uploads/` path

**ตรวจสอบ:** ให้แน่ใจว่า directory `./uploads` มีอยู่จริง:

```bash
mkdir -p uploads
```

---

## 3. Contact Mark as Read

### สถานะปัจจุบัน: ✅ พร้อมแล้ว

Backend **อัตโนมัติ mark as read** เมื่อเรียก `GET /api/v1/admin/contacts/{id}`
(repository `GetByID` เรียก `MarkAsRead` ภายในตัวเอง)

นอกจากนี้ `GET /api/v1/admin/contacts` ยังส่ง `meta.unread_count` กลับมาด้วย
Admin Panel ใช้ค่านี้แสดงจำนวน unread บน Dashboard และหน้า Messages แล้ว

---

## 4. Backend API Validation Rules

Admin Panel ต้อง validate client-side ให้ตรงกับ Backend เพื่อป้องกัน 400 errors:

| Endpoint | Required fields |
|----------|-----------------|
| `PUT /admin/site-settings` | `site_title` |
| `PUT /admin/hero` | `full_name` |
| `PUT /admin/about` | `title` |
| `POST/PUT /admin/skills` | `name`, `icon`, `category` (∈ frontend/backend/devops/tools) |
| `POST/PUT /admin/projects` | `title`, `description` |
| `POST/PUT /admin/experiences` | `role`, `company`, `period` |
| `POST/PUT /admin/social-links` | `name`, `url`, `icon` |
| `POST /api/v1/contact` (public) | `name`, `email`, `message` |

**หมายเหตุ:** Backend ใช้ `DisallowUnknownFields()` — ถ้าส่ง JSON field ที่ไม่อยู่ใน model จะได้ 400 error

---

## 5. สิ่งที่อาจต้องเพิ่มในอนาคต (Optional)

### 5.1 Nav Items Management

ปัจจุบัน nav_items ถูก hardcode ใน public handler (ไม่มี CRUD)
ถ้าต้องการจัดการ nav items ผ่าน Admin Panel ต้องเพิ่ม:

- Collection `nav_items` ใน MongoDB
- Repository + Handler สำหรับ CRUD
- Routes ใน router.go

**หมายเหตุ:** ปัจจุบัน Admin Panel ยังไม่มีหน้า Nav Items management
เพราะโครงสร้าง nav items ค่อนข้างคงที่ (ตาม sections ที่มี)

### 5.2 Social Links Reorder

ปัจจุบัน Backend ยังไม่มี reorder endpoint สำหรับ social links
ถ้าต้องการจัดลำดับ social links ต้องเพิ่ม:

```go
// ใน router.go
mux.HandleFunc("PUT /api/v1/admin/social-links/reorder", authMw(socialLinkH.Reorder))
```

---

## 6. Checklist

- [x] CORS รองรับ port 3001
- [x] File upload endpoint พร้อม
- [x] Static file serving ที่ `/uploads/`
- [x] JWT authentication พร้อม
- [x] Database seeding พร้อม
- [x] Contact mark-as-read (auto via GET by ID)
- [x] Contact unread_count ใน meta
- [ ] (Optional) Nav items CRUD
- [ ] (Optional) Social links reorder endpoint

---

## 7. Production Deployment Notes

เมื่อ deploy production ต้อง:

1. เปลี่ยน `JWT_SECRET` เป็นค่า random ที่ยาวและปลอดภัย
2. เปลี่ยน `ADMIN_PASSWORD` เป็นรหัสผ่านที่แข็งแรง
3. อัปเดต `ALLOWED_ORIGINS` เป็น domain จริง
4. ตั้งค่า HTTPS/TLS
5. ใช้ reverse proxy (nginx) สำหรับ static files
