# 08 — CORS & Local Development

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

## สรุป

1. **ตอนนี้**: ใช้ Vite Proxy → ใช้งานได้ทันทีไม่ต้องแก้ Backend
2. **ควรทำ**: เพิ่ม CORS middleware ที่ Go Backend → แล้วเปลี่ยนมาใช้ `.env` โดยตรง
3. **หลังแก้ CORS แล้ว**: ลบ Vite Proxy config ออก + ใส่ URL ใน `.env`
