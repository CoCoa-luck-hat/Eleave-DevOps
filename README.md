# ระบบบริหารจัดการการลา (LeaveSystem - E-Leave)

ระบบบริหารจัดการการลาอิเล็กทรอนิกส์แบบแยกส่วน (Decoupled Full-stack Architecture) พัฒนาด้วย **Vue 3 (Vite + Tailwind CSS + DaisyUI)** สำหรับส่วนหน้าบ้าน (Frontend) และ **Node.js (Express + MySQL + Multer + JWT)** สำหรับส่วนหลังบ้าน (Backend) ออกแบบโครงสร้างตามมาตรฐานสากล รองรับการทำงานร่วมกับ Docker และ CI/CD Pipeline

---

## 🛠 เทคโนโลยีที่ใช้งาน (Tech Stack)

### หน้าบ้าน (Frontend)
- **Vue 3 (Composition API / Script Setup)** + **Vite**
- **Tailwind CSS v4** + **DaisyUI 5**: ออกแบบ UI และ Responsive Layout ครอบคลุม Mobile & Desktop
- **Pinia**: จัดการ State การล็อกอิน ข้อมูลใบลา และข้อมูลผู้ใช้
- **Vue Router**: จัดการเส้นทาง URL พร้อม Navigation Guards ตรวจสอบสิทธิ์ (Role-based: Employee, Manager, Admin)
- **jwt-decode**: ถอดรหัส JWT Payload เพื่อตรวจสอบข้อมูลผู้ใช้ สิทธิ์ และเวลาหมดอายุ
- **Vee-Validate & Yup**: ตรวจสอบความถูกต้องของข้อมูล (Form Validation) ฝั่ง Frontend ก่อนส่ง Request
- **Axios**: ส่ง Request พร้อม Interceptor แนบ Token และส่งผ่านไปยัง Backend

### หลังบ้าน (Backend)
- **Node.js + Express**: RESTful API Server พร้อม Express Router แยกโมดูลอย่างเป็นระเบียบ
- **MySQL & mysql2/promise**: ฐานข้อมูลแบบ Relation พร้อม Connection Pool และ Prepared Statements
- **jsonwebtoken (JWT)**: ออก Token พร้อมลงนามดิจิทัล (Signing) และมี Middleware ตรวจสอบสิทธิ์ (`VerifyToken`)
- **Multer**: จัดการอัปโหลดไฟล์รูปภาพโปรไฟล์ และไฟล์หลักฐานประกอบการลา (JPEG, PNG, PDF)
- **express-validator**: ตรวจสอบความถูกต้องของข้อมูลที่ส่งเข้ามาในแต่ละ Endpoint
- **Docker**: มี `backend/Dockerfile` และ `frontend/Dockerfile` พร้อม `docker-compose.yaml`

---

## 📖 เอกสารการออกแบบ RESTful API (Design / README.md)

ระบบออกแบบตามหลักการ **RESTful Architecture** โดยใช้ HTTP Methods สื่อความหมายชัดเจน และระบุข้อมูลที่ใช้ส่ง (Query, Path, Body, Headers) อย่างเป็นระบบ:

### 📑 ตารางสรุป Endpoint และข้อมูลที่ใช้ส่ง (API Specifications)

| Method | Endpoint | ชนิดข้อมูลที่ใช้ส่ง | ข้อมูลที่ส่ง (Query / Path / Body) | สิทธิ์การเข้าถึง |
| :---: | :--- | :---: | :--- | :--- |
| **POST** | `/api/register` | Body (JSON) | `fullname`, `email`, `password` | Public |
| **POST** | `/api/login` | Body (JSON) | `email`, `password` | Public |
| **GET** | `/api/profile` | Headers | `Authorization: Bearer <token>` | เข้าสู่ระบบแล้ว |
| **PUT** | `/api/profile` | Body (JSON) | `fullname`, `email`, `password` | เข้าสู่ระบบแล้ว |
| **GET** | `/api/users` | **Query Params** | `?search=...`, `?role=...` | เฉพาะ Admin |
| **POST** | `/api/users` | Body (JSON) | `fullname`, `email`, `password`, `role`, `group_id` | เฉพาะ Admin |
| **GET** | `/api/users/:id` | **Path Param** | `:id` (รหัสผู้ใช้) | เจ้าของ หรือ Admin |
| **PUT** | `/api/users/:id` | **Path + Body** | `:id` + `fullname`, `email`, `password`, `group_id` | เจ้าของ หรือ Admin |
| **DELETE** | `/api/users/:id` | **Path Param** | `:id` (รหัสผู้ใช้, ป้องกันการลบตนเอง) | เฉพาะ Admin |
| **POST** | `/api/users/:id/upload-profile` | **Path + FormData** | `:id` + `profile` (ไฟล์รูปภาพ) | เจ้าของ หรือ Admin |
| **GET** | `/api/reports` | **Query Params** | `?status=pending`, `?search=สมชาย` | Manager / Admin |
| **GET** | `/api/reports/:id` | **Path Param** | `:id` (รหัสใบลา) | เจ้าของ / Manager / Admin |
| **GET** | `/api/reports/user/:userId` | **Path Param** | `:userId` (รหัสพนักงาน) | เจ้าของ / Manager / Admin |
| **POST** | `/api/reports` | **Body (FormData)** | `leave_type_id`, `leave_at`, `leave_end`, `leave_days`, `reason`, `file_report` | พนักงาน (Employee) |
| **PUT** | `/api/reports/:id` | **Path + FormData** | `:id` + ข้อมูลแก้ไขใบลา + ไฟล์เอกสารใหม่ | เจ้าของ (เฉพาะ Pending) |
| **DELETE** | `/api/reports/:id` | **Path Param** | `:id` (รหัสใบลา) | เจ้าของ (เฉพาะ Pending) |
| **PUT** | `/api/reports/:id/status` | **Path + Body (JSON)** | `:id` + `status` ('approved'/'rejected'), `reject_reason` | Manager / Admin |
| **GET** | `/api/leave-types` | Headers | `Authorization: Bearer <token>` | ทุกบทบาท |
| **POST** | `/api/leave-types` | Body (JSON) | `leave_type_name`, `max_days` | เฉพาะ Admin |
| **PUT** | `/api/leave-types/:id` | **Path + Body (JSON)** | `:id` + `leave_type_name`, `max_days` | เฉพาะ Admin |
| **DELETE** | `/api/leave-types/:id` | **Path Param** | `:id` (รหัสประเภทการลา) | เฉพาะ Admin |

> 📘 **ดูเอกสาร API ฉบับสมบูรณ์พร้อมตัวอย่าง Request / Response และ Status Codes:** [docs/API_DOCUMENTATION.md](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/API_DOCUMENTATION.md)

---

## 👥 บัญชีผู้ใช้เริ่มต้นสำหรับทดสอบ (Seed Accounts)

| Email | Password | Role | สิทธิ์การใช้งาน |
| :--- | :--- | :---: | :--- |
| **admin@example.com** | **password123** | `admin` | สิทธิ์สูงสุด ดูแลผู้ใช้ จัดการประเภทการลา ตรวจสอบภาพรวม |
| **manager@example.com** | **password123** | `manager` | ผู้อนุมัติ ตรวจสอบใบลา อนุมัติ/ปฏิเสธพร้อมระบุเหตุผล |
| **employee@example.com** | **password123** | `employee` | พนักงาน ยื่นใบลาใหม่ แนบหลักฐาน ติดตามสถานะ ยกเลิกใบลา |

---

## 📚 เอกสารและผังงานระบบทั้งหมด (Documentation Index)

- [1. ผังงานระบบการเข้าสู่ระบบ (Login Flow)](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/1-login-flow.md)
- [2. ผังงานกระบวนการของผู้ดูแลระบบ (Admin Flow)](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/2-admin-flow.md)
- [3. ผังงานกระบวนการของผู้ใช้งานระดับ 1 (User Level 1 Flow)](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/3-user-level-1-flow.md)
- [4. ผังงานกระบวนการของผู้ใช้งานระดับ 2 (User Level 2 Flow)](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/4-user-level-2-flow.md)
- [5. ผังภาพรวมของระบบทั้งหมด (Use Case Diagram)](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/5-usecase-diagram.md)
- [6. รายละเอียดการออกแบบ RESTful API Specification](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/API_DOCUMENTATION.md)
