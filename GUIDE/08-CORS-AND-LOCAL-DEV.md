# 08 — CORS & Local Development

## ใครต้องอ่านเอกสารนี้

- `Website_Config` — ต้องอ่านเพื่อตั้งค่า `NUXT_PUBLIC_API_BASE_URL` และลบ/ใช้ Vite proxy ให้ถูกตามสภาพแวดล้อม
- `Admin_Website_Management` — ต้องอ่านเพื่อเพิ่ม CORS middleware และตั้ง `CORS_ALLOWED_ORIGINS`
- `Portfolio` หรือโปรเจกต์เว็บ port หน้าบ้าน — ต้องอ่านเมื่อเว็บ port เรียก backend จาก browser หรือมีหลาย domain/subdomain

ถ้าเริ่มทำ multi-site ตาม `GUIDE/07-MULTI-SITE-ARCHITECTURE.md` ให้ส่งเอกสารนี้ให้ Backend และเว็บ port อ่านด้วย เพราะ domain ของ admin และ domain ของ Portfolio แต่ละ site ต้องถูกอนุญาตใน CORS/hosting ให้ครบ

---

## สถานะปัจจุบัน: ใช้ Vite Proxy (วิธีชั่วคราว)

ตอนนี้ local dev ใช้ **Vite Proxy** เป็นตัวกลาง เพราะ Go Backend ยังไม่ได้ตั้ง CORS ให้อนุญาต `localhost`

```
Browser (localhost:3001) → Vite Dev Server → Backend (Render)
```

### ไฟล์ที่เกี่ยวข้อง

- `.env` — ค่าว่าง (`NUXT_PUBLIC_API_BASE_URL=`)
- `nuxt.config.ts` — มี `vite.server.proxy` ที่ส่ง `/api` และ `/uploads` ไปยัง Render

### ข้อเสียของวิธี Proxy

- ใช้ได้เฉพาะ `npm run dev` เท่านั้น (production build ไม่มี proxy)
- เพิ่ม latency เล็กน้อย (request ผ่านตัวกลาง)
- Debug network ยากขึ้นเพราะ URL ที่เห็นในเบราว์เซอร์เป็น localhost ไม่ใช่ URL จริง
- ต้อง maintain proxy config แยกจาก env

---

## เป้าหมาย: ใช้ `.env` โดยตรง (วิธีถาวร)

วิธีที่ดีกว่าคือให้ Browser เรียก Backend ตรงๆ โดยไม่ต้องมีตัวกลาง

```
Browser (localhost:3001) → Backend (Render) โดยตรง
```

### ข้อดีของวิธี .env

- ใช้ได้ทั้ง dev และ production
- ตั้งค่าง่าย แค่เปลี่ยน URL ใน `.env`
- ไม่มี latency จากตัวกลาง
- Debug network ตรงไปตรงมา เห็น URL จริงใน DevTools

### สิ่งที่ต้องทำ: แก้ CORS ที่ Go Backend

ปัญหาคือ Browser มีกฎ CORS — ถ้า Frontend กับ Backend อยู่คนละ origin (domain/port) Browser จะบล็อก request ยกเว้น Backend ส่ง header อนุญาตกลับมา

#### ขั้นตอนที่ 1: เพิ่ม CORS Middleware ใน Go Backend

ไฟล์: `internal/middleware/middleware.go` หรือ `internal/router/router.go`

```go
func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            origin := r.Header.Get("Origin")

            for _, allowed := range allowedOrigins {
                if origin == allowed {
                    w.Header().Set("Access-Control-Allow-Origin", origin)
                    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
                    w.Header().Set("Access-Control-Allow-Credentials", "true")
                    w.Header().Set("Access-Control-Max-Age", "86400")
                    break
                }
            }

            if r.Method == http.MethodOptions {
                w.WriteHeader(http.StatusNoContent)
                return
            }

            next.ServeHTTP(w, r)
        })
    }
}
```

#### ขั้นตอนที่ 2: ใช้ CORS Middleware ใน Router

```go
allowedOrigins := []string{
    "http://localhost:3001",                    // local dev
    "https://your-admin-frontend.onrender.com", // deployed frontend
}

mux := http.NewServeMux()
// ... register routes ...

handler := CORS(allowedOrigins)(mux)
```

> **แนะนำ**: เก็บ allowed origins ใน environment variable เพื่อไม่ต้อง hardcode

```go
// อ่านจาก env
originsEnv := os.Getenv("CORS_ALLOWED_ORIGINS")
allowedOrigins := strings.Split(originsEnv, ",")
```

Render Environment Variable:
```
CORS_ALLOWED_ORIGINS=http://localhost:3001,https://your-admin-frontend.onrender.com
```

สำหรับ multi-site ต้องเพิ่ม origin ของเว็บ port หน้าบ้านด้วย เช่น:

```text
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000,https://admin.example.com,https://user-a.com,https://user-b.com
```

ถ้าใช้ credential/cookie ไม่ควรใช้ `*` เป็น `Access-Control-Allow-Origin` ให้ตรวจ origin จาก allowlist แล้ว echo origin ที่ผ่านเท่านั้น

#### ขั้นตอนที่ 3: แก้ `.env` ของ Admin Panel

```env
NUXT_PUBLIC_API_BASE_URL=https://admin-api-config.onrender.com
```

#### ขั้นตอนที่ 4: ลบ Vite Proxy ออกจาก `nuxt.config.ts`

ลบส่วน `vite.server.proxy` ทิ้ง เพราะไม่ต้องใช้แล้ว

```ts
// ลบส่วนนี้ออก
vite: {
  server: {
    proxy: { ... },
  },
},
```

---

## เปรียบเทียบทั้ง 2 วิธี

| | Vite Proxy (ชั่วคราว) | .env + CORS (ถาวร) |
|--|----------------------|-------------------|
| ตั้งค่า Frontend | ต้องเพิ่ม proxy config | แค่ใส่ URL ใน `.env` |
| ต้องแก้ Backend | ไม่ต้อง | ต้องเพิ่ม CORS middleware |
| ใช้กับ production | ไม่ได้ | ได้ |
| ใช้กับ dev | ได้ | ได้ |
| Performance | ช้ากว่าเล็กน้อย (ผ่านตัวกลาง) | เร็วกว่า (ตรงไป) |
| Debug | ยาก (URL เป็น localhost) | ง่าย (เห็น URL จริง) |

---

## Multi-site และหลาย domain ต้องระวังอะไร

เมื่อ Portfolio หลายเว็บใช้ backend ตัวเดียวกัน จะมี origin มากขึ้น:

```text
Admin Panel: https://admin.example.com
Portfolio A: https://user-a.com
Portfolio B: https://user-b.com
Local Admin: http://localhost:3001
Local Portfolio: http://localhost:3000
Backend: https://api.example.com
```

Backend ต้องอนุญาต origin ที่จำเป็นเท่านั้น:

- Admin domain ใช้เรียก `/api/v1/admin/...`
- Portfolio domains ใช้เรียก `/api/v1/public/...` และส่ง contact form
- Localhost ports ใช้เฉพาะตอน dev

ถ้าเว็บ port เป็น SSR และเรียก backend จาก server เท่านั้น CORS จะไม่เกี่ยวกับ server-to-server request แต่ถ้า browser เรียก backend โดยตรง เช่น contact form, image upload หรือ client-side fetch ยังต้องตั้ง CORS ให้ถูก

สำหรับ domain/subdomain ใหม่ ควรเพิ่ม origin ผ่าน environment variable ไม่ hardcode ในโค้ด Go เพื่อให้เพิ่ม site ใหม่ได้โดยไม่ต้อง deploy backend ใหม่ทุกครั้ง ถ้า backend ต้องรองรับ custom domain จำนวนมาก ให้เก็บ allowed public origins จาก `sites.domains` แล้ว validate origin กับข้อมูลใน database

---

## สรุป

1. **ตอนนี้**: ใช้ Vite Proxy → ใช้งานได้ทันทีไม่ต้องแก้ Backend
2. **ควรทำ**: เพิ่ม CORS middleware ที่ Go Backend → แล้วเปลี่ยนมาใช้ `.env` โดยตรง
3. **หลังแก้ CORS แล้ว**: ลบ Vite Proxy config ออก + ใส่ URL ใน `.env`
4. **ถ้าทำ multi-site**: เพิ่ม origin ของ Admin และ Portfolio ทุก domain ที่ต้องเรียก backend จาก browser
