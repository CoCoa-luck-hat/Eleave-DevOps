# เอกสารการออกแบบและการเรียกใช้งาน RESTful API (API Documentation)

ระบบบริหารจัดการการลา (LeaveSystem / E-Leave) ออกแบบตามสถาปัตยกรรม **RESTful API** มาตรฐานสากล โดยใช้ HTTP Methods สื่อความหมายอย่างเหมาะสม เชื่อมต่อด้วยรูปแบบข้อมูล JSON และรองรับ Multipart/Form-data สำหรับการอัปโหลดไฟล์ พร้อมทั้งควบคุมความปลอดภัยด้วย **JSON Web Token (JWT)**

---

## 🔒 ข้อมูลความปลอดภัยและ Headers พื้นฐาน (Authentication & Headers)

ทุก Endpoint ที่มีสัญลักษณ์ 🔒 จำเป็นต้องแนบ **JWT Token** ในส่วน Request Headers เสมอ:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json
```
*(กรณีอัปโหลดไฟล์ ให้เว้น Content-Type ให้เบราว์เซอร์หรือ Postman กำหนดเป็น `multipart/form-data` อัตโนมัติ)*

---

## 📑 สรุปภาพรวม API ทั้งหมดในระบบ (API Summary Matrix)

| หมวดหมู่ | Method | Endpoint | ข้อมูลที่ใช้ส่ง (Parameters & Body) | สิทธิ์การเข้าถึง |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/register` | **Body (JSON):** `fullname`, `email`, `password` | สาธารณะ (Public) |
| **Auth** | `POST` | `/api/login` | **Body (JSON):** `email`, `password` | สาธารณะ (Public) |
| **Auth** | `GET` | `/api/profile` | 🔒 **Headers:** `Bearer Token` | ผู้ใช้ทุกคน |
| **Leave** | `GET` | `/api/reports` | 🔒 **Query:** `status`, `search` | Manager / Admin |
| **Leave** | `GET` | `/api/reports/:id` | 🔒 **Path:** `id` | เจ้าของ, Manager, Admin |
| **Leave** | `GET` | `/api/reports/user/:userId` | 🔒 **Path:** `userId` | เจ้าของ, Manager, Admin |
| **Leave** | `POST` | `/api/reports` | 🔒 **Body (FormData):** `leave_type_id`, `leave_at`, `leave_end`, `leave_days`, `reason`, `file_report` | พนักงาน (Employee) |
| **Leave** | `PUT` | `/api/reports/:id` | 🔒 **Path:** `id` \| **Body (FormData):** ข้อมูลแก้ไขใบลา + ไฟล์ | เจ้าของใบลา (Pending) |
| **Leave** | `DELETE` | `/api/reports/:id` | 🔒 **Path:** `id` | เจ้าของใบลา (Pending) |
| **Leave** | `PUT` | `/api/reports/:id/status` | 🔒 **Path:** `id` \| **Body (JSON):** `status`, `reject_reason` | Manager / Admin |
| **Type** | `GET` | `/api/leave-types` | 🔒 **Headers:** `Bearer Token` | ผู้ใช้ทุกคน |
| **Type** | `POST` | `/api/leave-types` | 🔒 **Body (JSON):** `leave_type_name`, `max_days` | Admin |
| **Type** | `PUT` | `/api/leave-types/:id` | 🔒 **Path:** `id` \| **Body (JSON):** `leave_type_name`, `max_days` | Admin |
| **Type** | `DELETE` | `/api/leave-types/:id` | 🔒 **Path:** `id` | Admin |
| **Group** | `GET` | `/api/groups` | 🔒 **Headers:** `Bearer Token` | ผู้ใช้ทุกคน |
| **Group** | `POST` | `/api/groups` | 🔒 **Body (JSON):** `group_name` | Admin |
| **Group** | `PUT` | `/api/groups/:id` | 🔒 **Path:** `id` \| **Body (JSON):** `group_name` | Admin |
| **Group** | `DELETE` | `/api/groups/:id` | 🔒 **Path:** `id` | Admin |

---

## 🔍 รายละเอียดข้อมูลที่ใช้ส่งในแต่ละ API (Detailed API Specifications)

### 1. ระบบยืนยันตัวตน (Authentication Service)

#### 1.1 สมัครสมาชิกใหม่
- **Method:** `POST`
- **Endpoint:** `/api/register`
- **Request Body (JSON):**
  ```json
  {
    "fullname": "สมชาย ใจดี",
    "email": "somchai@example.com",
    "password": "password123"
  }
  ```
- **Response Body (201 Created):**
  ```json
  {
    "message": "สมัครสมาชิกสำเร็จ"
  }
  ```
- **Error Response (400 / 409):**
  ```json
  { "message": "กรุณากรอกชื่อ-นามสกุล" } // 400 Bad Request
  { "message": "อีเมลนี้ถูกใช้ไปแล้ว" }   // 409 Conflict
  ```

#### 1.2 เข้าสู่ระบบ (รับ JWT Token)
- **Method:** `POST`
- **Endpoint:** `/api/login`
- **Request Body (JSON):**
  ```json
  {
    "email": "somchai@example.com",
    "password": "password123"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "message": "เข้าสู่ระบบสำเร็จ",
    "user": {
      "user_id": 1,
      "fullname": "สมชาย ใจดี",
      "email": "somchai@example.com",
      "role": "employee"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  { "message": "อีเมลหรือรหัสผ่านผิด" }
  ```

---

### 2. ระบบบริหารจัดการการลา (Leave Management Service)

#### 2.1 ยื่นใบลาใหม่พร้อมแนบเอกสาร (Multipart/Form-Data)
- **Method:** `POST`
- **Endpoint:** `/api/reports`
- **Request Body (`multipart/form-data`):**
  | ฟิลด์ | ชนิด | คำอธิบาย |
  | :--- | :---: | :--- |
  | `leave_type_id` | Text | รหัสประเภทการลา (เช่น `1` สำหรับลาป่วย) |
  | `leave_at` | Text | วันที่เริ่มต้น (เช่น `2026-02-15`) |
  | `leave_end` | Text | วันที่สิ้นสุด (เช่น `2026-02-16`) |
  | `leave_days` | Text/Number | จำนวนวันลา (เช่น `2`) |
  | `reason` | Text | เหตุผลการลา |
  | `file_report` | **File** | ไฟล์หลักฐาน เช่น ใบรับรองแพทย์ (PNG, JPG, PDF) |
- **Response Body (201 Created):**
  ```json
  {
    "message": "สร้างใบลาสำเร็จ"
  }
  ```

#### 2.2 แก้ไขข้อมูลคำขอลา (Path Parameter + Multipart/Form-Data)
- **Method:** `PUT`
- **Endpoint:** `/api/reports/:id`
- **Path Parameter:** `id` เช่น `/api/reports/1`
- **เงื่อนไข:** แก้ไขได้เฉพาะใบลาของตนเองที่มีสถานะ `pending` เท่านั้น
- **Request Body (`multipart/form-data`):**
  | ฟิลด์ | ชนิด | คำอธิบาย |
  | :--- | :---: | :--- |
  | `leave_type_id` | Text (Optional) | รหัสประเภทการลาใหม่ |
  | `leave_at` | Text (Optional) | วันที่เริ่มต้นใหม่ |
  | `leave_end` | Text (Optional) | วันที่สิ้นสุดใหม่ |
  | `leave_days` | Text/Number (Optional) | จำนวนวันลาใหม่ |
  | `reason` | Text (Optional) | เหตุผลการลาใหม่ |
  | `file_report` | **File** (Optional) | ไฟล์หลักฐานใหม่เพื่อแทนที่ไฟล์เดิม |
- **Response Body (200 OK):**
  ```json
  {
    "message": "แก้ไขใบลาสำเร็จ"
  }
  ```

#### 2.3 ดึงรายการใบลาทั้งหมด (Query Parameters สำหรับ Manager/Admin)
- **Method:** `GET`
- **Endpoint:** `/api/reports`
- **Query Parameters:**
  - `status` (Optional): `pending`, `approved`, `rejected`
  - `search` (Optional): ค้นหาชื่อพนักงาน หรือเหตุผล
- **ตัวอย่าง URL:** `/api/reports?status=pending&search=สมชาย`
- **Response Body (200 OK):**
  ```json
  {
    "reports": [
      {
        "report_id": 1,
        "fullname": "สมชาย ใจดี",
        "email": "somchai@example.com",
        "leave_type_name": "ลาป่วย",
        "leave_at": "2026-02-15",
        "leave_end": "2026-02-16",
        "leave_days": 2,
        "status": "pending",
        "file_report": "1793637786009-693588760.png"
      }
    ]
  }
  ```

#### 2.4 อนุมัติหรือปฏิเสธใบลา (Path Parameter + JSON Body)
- **Method:** `PUT`
- **Endpoint:** `/api/reports/:id/status`
- **Path Parameter:** `id` รหัสใบลา เช่น `/api/reports/1/status`
- **Request Body (JSON กรณีอนุมัติ):**
  ```json
  {
    "status": "approved"
  }
  ```
- **Request Body (JSON กรณีปฏิเสธ):**
  ```json
  {
    "status": "rejected",
    "reject_reason": "เอกสารใบรับรองแพทย์ไม่ชัดเจน กรุณายื่นใหม่"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "message": "อนุมัติใบลาสำเร็จ" // หรือ "ปฏิเสธใบลาสำเร็จ"
  }
  ```

#### 2.5 ลบ/ยกเลิกคำขอลา (Path Parameter)
- **Method:** `DELETE`
- **Endpoint:** `/api/reports/:id`
- **Path Parameter:** `id` เช่น `/api/reports/1`
- **เงื่อนไข:** ลบได้เฉพาะใบลาที่มีสถานะ `pending` เท่านั้น
- **Response Body (200 OK):**
  ```json
  {
    "message": "ลบใบลาสำเร็จ"
  }
  ```

---

## 🛡️ รูปแบบการตอบกลับกรณีเกิด Error (Standard Error Responses)

ระบบมีการจัดการ Exception Handling ครอบคลุมทุกกรณี โดยส่ง HTTP Status Code พร้อมข้อความ JSON ที่เข้าใจง่าย:

| HTTP Status | ความหมาย | ตัวอย่าง Response JSON |
| :---: | :--- | :--- |
| **400** | ข้อมูลไม่ครบถ้วน / รูปแบบผิด | `{ "message": "กรุณากรอกข้อมูลให้ครบถ้วน" }` |
| **401** | ไม่ได้แนบ Token หรือ Token หมดอายุ | `{ "message": "ไม่มี Token" }` หรือ `{ "message": "Token หมดอายุ" }` |
| **403** | ไม่มีสิทธิ์เข้าถึง (Forbidden) | `{ "message": "เฉพาะแอดมินเท่านั้น" }` |
| **404** | ไม่พบข้อมูลที่ต้องการ (Not Found) | `{ "message": "ไม่พบข้อมูลผู้ใช้" }` |
| **409** | ข้อมูลซ้ำ (Conflict) | `{ "message": "อีเมลนี้ถูกใช้ไปแล้ว" }` |
| **500** | ข้อผิดพลาดที่เซิร์ฟเวอร์ | `{ "message": "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์" }` |
