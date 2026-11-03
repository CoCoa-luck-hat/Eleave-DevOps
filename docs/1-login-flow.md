# ผังงานระบบการเข้าสู่ระบบ (Login Flow)

เอกสารนี้แสดงผังงานกระบวนการทำงานของการเข้าสู่ระบบ (Login Flow) ของระบบ **LeaveSystem (ระบบบริหารจัดการการลา)** ครอบคลุมตั้งแต่การกรอกข้อมูล การตรวจสอบความถูกต้อง จนถึงการนำทางผู้ใช้ไปยังหน้าหลักตามบทบาทหน้าที่ (Role-Based Redirection)

---

## 1. แผนภาพผังงาน (Flowchart)

```mermaid
flowchart TD
    Start(["เริ่มต้น: เข้าสู่หน้าระบบ"]) --> InputCredentials["ผู้ใช้งานกรอกอีเมล (Email) และรหัสผ่าน (Password)"]
    InputCredentials --> ClickLogin["กดปุ่ม 'เข้าสู่ระบบ'"]
    
    ClickLogin --> CheckInput{"ข้อมูลครบถ้วนหรือไม่?<br/>(ตรวจสอบรูปแบบอีเมลและรหัสผ่าน)"}
    CheckInput -- "ไม่ครบถ้วน / รูปแบบไม่ถูกต้อง" --> ShowInputError["แสดงข้อความแจ้งเตือนให้กรอกข้อมูลให้ถูกต้อง"]
    ShowInputError --> InputCredentials
    
    CheckInput -- "ครบถ้วน" --> VerifyAuth{"ตรวจสอบความถูกต้อง<br/>ของอีเมลและรหัสผ่าน"}
    VerifyAuth -- "ข้อมูลไม่ถูกต้อง" --> ShowAuthError["แสดงข้อความแจ้งเตือน<br/>'อีเมลหรือรหัสผ่านผิด'"]
    ShowAuthError --> InputCredentials
    
    VerifyAuth -- "ข้อมูลถูกต้อง" --> LoginSuccess["เข้าสู่ระบบสำเร็จ<br/>บันทึกเซสชันการเข้าใช้งาน (Token)"]
    LoginSuccess --> CheckRole{"ตรวจสอบบทบาทผู้ใช้งาน<br/>(User Role)"}
    
    CheckRole -- "ผู้ดูแลระบบ (Admin)" --> RouteAdmin["นำทางไปยังหน้าแดชบอร์ดผู้ดูแลระบบ<br/>(/admin)"]
    CheckRole -- "ผู้ใช้งานระดับ 2: ผู้จัดการ (Manager)" --> RouteManager["นำทางไปยังหน้าแดชบอร์ดผู้จัดการฝ่าย<br/>(/manager)"]
    CheckRole -- "ผู้ใช้งานระดับ 1: พนักงานทั่วไป (Employee)" --> RouteUser["นำทางไปยังหน้าประวัติการลา<br/>(/user)"]
    
    RouteAdmin --> End(["สิ้นสุดกระบวนการ"])
    RouteManager --> End
    RouteUser --> End

    classDef startEnd fill:#0f766e,stroke:#115e59,stroke-width:2px,color:#ffffff;
    classDef process fill:#f8fafc,stroke:#64748b,stroke-width:1.5px,color:#1e293b;
    classDef decision fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a8a;
    classDef error fill:#fef2f2,stroke:#ef4444,stroke-width:1.5px,color:#991b1b;
    classDef success fill:#f0fdf4,stroke:#22c55e,stroke-width:1.5px,color:#14532d;
    classDef rolePath fill:#faf5ff,stroke:#a855f7,stroke-width:1.5px,color:#581c87;

    class Start,End startEnd;
    class InputCredentials,ClickLogin process;
    class CheckInput,VerifyAuth,CheckRole decision;
    class ShowInputError,ShowAuthError error;
    class LoginSuccess success;
    class RouteAdmin,RouteManager,RouteUser rolePath;
```

---

## 2. คำอธิบายขั้นตอนการทำงาน (Process Steps)

| ลำดับ | กิจกรรม / ขั้นตอน | รายละเอียด |
| :--- | :--- | :--- |
| **1** | เข้าสู่หน้าระบบ | ผู้ใช้เปิดหน้าเว็บระบบ ระบบจะตรวจสอบหากมีเซสชันเดิมที่ยังไม่หมดอายุจะนำทางไปยังหน้าตามบทบาทอัตโนมัติ หากยังไม่มีจะแสดงหน้าเข้าสู่ระบบ (`/login`) |
| **2** | กรอกข้อมูลการเข้าสู่ระบบ | ผู้ใช้กรอกข้อมูลชื่อบัญชีผู้ใช้ในรูปแบบอีเมล และรหัสผ่านที่กำหนดไว้ |
| **3** | ตรวจสอบความถูกต้องเบื้องต้น (Client Validation) | ระบบตรวจสอบความสมบูรณ์ของฟอร์ม เช่น อีเมลต้องตรงตามรูปแบบ (Email Format) และต้องกรอกรหัสผ่าน |
| **4** | ตรวจสอบข้อมูลบัญชีผู้ใช้ (Authentication) | ระบบทำการตรวจสอบความถูกต้องของอีเมลและรหัสผ่านกับฐานข้อมูล |
| **5** | กรณีการตรวจสอบล้มเหลว | ระบบจะแจ้งเตือนข้อผิดพลาดแก่ผู้ใช้ และคงหน้าจอไว้เพื่อให้กรอกข้อมูลใหม่ |
| **6** | การสร้างเซสชันและตรวจสอบบทบาท | เมื่อผ่านการตรวจสอบ ระบบจะสร้าง Token ประจำเซสชัน และอ่านบทบาท (`role`) ของผู้ใช้งาน |
| **7** | นำทางเข้าสู่หน้าหลักตามบทบาท (Redirection) | • **Admin**: เข้าสู่หน้าภาพรวมแดชบอร์ดระบบ จัดการผู้ใช้และประเภทการลา<br/>• **Manager (ระดับ 2)**: เข้าสู่หน้าพิจารณาและอนุมัติคำขอลา<br/>• **Employee (ระดับ 1)**: เข้าสู่หน้าสถิติประวัติการลาและยื่นใบลาใหม่ |
