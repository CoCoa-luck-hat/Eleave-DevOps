# ผังงานกระบวนการของผู้ดูแลระบบ (Admin Flow)

เอกสารนี้แสดงผังงานกระบวนการทำงานของผู้ดูแลระบบ (Admin) ในระบบ **LeaveSystem (ระบบบริหารจัดการการลา)** ซึ่งมีหน้าที่ควบคุม ดูแลข้อมูลหลักของระบบ (Master Data) บัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และสามารถตรวจสอบภาพรวมการลาทั้งหมดในองค์กรได้

---

## 1. แผนภาพผังงาน (Flowchart)

```mermaid
flowchart TD
    Start(["เริ่มต้น: เข้าสู่ระบบสำเร็จด้วยสิทธิ์ Admin"]) --> AdminDashboard["เข้าสู่หน้าแดชบอร์ดผู้ดูแลระบบ (/admin)"]
    
    AdminDashboard --> SelectMenu{"เลือกเมนูการทำงาน"}
    
    %% เมนู 1: จัดการผู้ใช้งาน
    SelectMenu -- "จัดการผู้ใช้ (/admin/users)" --> UserMgmt["เข้าสู่หน้ารายการผู้ใช้งาน"]
    UserMgmt --> UserAction{"เลือกการดำเนินการ"}
    UserAction -- "เพิ่มผู้ใช้ใหม่" --> AddUser["กรอกชื่อ, อีเมล, รหัสผ่าน, กำหนดสิทธิ์ (Role), เลือกฝ่าย"]
    AddUser --> SaveUser["บันทึกข้อมูลผู้ใช้ใหม่"] --> UserMgmt
    UserAction -- "แก้ไขข้อมูล" --> EditUser["แก้ไขชื่อ, อีเมล, รหัสผ่าน หรือเปลี่ยนสังกัดฝ่าย"]
    EditUser --> UpdateUser["บันทึกการแก้ไข"] --> UserMgmt
    UserAction -- "เปลี่ยนบทบาท (Role)" --> ChangeRole["เลือกบทบาทใหม่ (Employee / Manager / Admin)"]
    ChangeRole --> UpdateRole["บันทึกบทบาทใหม่ (ระบบป้องกันไม่ให้เปลี่ยนสิทธิ์ตนเอง)"] --> UserMgmt
    UserAction -- "ลบผู้ใช้" --> DeleteUser["ยืนยันการลบผู้ใช้ (ระบบป้องกันไม่ให้ลบบัญชีตนเอง)"]
    DeleteUser --> RemoveUser["ลบข้อมูลออกจากระบบ"] --> UserMgmt

    %% เมนู 2: จัดการประเภทการลา
    SelectMenu -- "จัดการประเภทการลา (/admin/leave-types)" --> LeaveTypeMgmt["เข้าสู่หน้ารายการประเภทการลา"]
    LeaveTypeMgmt --> LTAction{"เลือกการดำเนินการ"}
    LTAction -- "เพิ่มประเภทการลา" --> AddLT["ระบุชื่อประเภทการลา และจำนวนวันลาสูงสุดต่อปี"]
    AddLT --> SaveLT["บันทึกประเภทการลาใหม่"] --> LeaveTypeMgmt
    LTAction -- "แก้ไขประเภทการลา" --> EditLT["แก้ไขชื่อประเภทการลา หรือจำนวนวันลาสูงสุด"]
    EditLT --> UpdateLT["บันทึกการแก้ไข"] --> LeaveTypeMgmt
    LTAction -- "ลบประเภทการลา" --> DeleteLT["ยืนยันการลบประเภทการลา"]
    DeleteLT --> RemoveLT["ลบประเภทการลาออกจากระบบ"] --> LeaveTypeMgmt

    %% เมนู 3: ตรวจสอบและพิจารณาคำขอลา
    SelectMenu -- "ตรวจสอบภาพรวมการลา" --> LeaveOverview["เข้าสู่หน้ารายการคำขอลาทั้งหมด"]
    LeaveOverview --> FilterLeave["ค้นหาตามชื่อพนักงาน / กรองตามสถานะการลา"]
    FilterLeave --> ViewDetail["เปิดดูรายละเอียดคำขอและเอกสารแนบ"]
    ViewDetail --> NeedAction{"ต้องการพิจารณาคำขอหรือไม่?"}
    NeedAction -- "ไม่ต้องการ (ดูอย่างเดียว)" --> LeaveOverview
    NeedAction -- "ต้องการพิจารณา (เฉพาะสถานะรออนุมัติ)" --> DecideLeave{"ผลการพิจารณา"}
    DecideLeave -- "อนุมัติ" --> ApproveLeave["อนุมัติคำขอลา (สถานะ: Approved)"] --> LeaveOverview
    DecideLeave -- "ปฏิเสธ" --> RejectLeave["กรอกเหตุผลการปฏิเสธ และยืนยัน (สถานะ: Rejected)"] --> LeaveOverview

    %% การออกจากระบบ
    SelectMenu -- "จัดการโปรไฟล์ส่วนตัว" --> EditProfile["แก้ไขข้อมูลส่วนตัว / เปลี่ยนรูปโปรไฟล์"] --> AdminDashboard
    SelectMenu -- "ออกจากระบบ" --> Logout["ล้างข้อมูลเซสชัน (Token) และกลับสู่หน้า Login"]
    Logout --> End(["สิ้นสุดกระบวนการ"])

    classDef startEnd fill:#0f766e,stroke:#115e59,stroke-width:2px,color:#ffffff;
    classDef mainNode fill:#1e40af,stroke:#1d4ed8,stroke-width:1.5px,color:#ffffff;
    classDef decision fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a8a;
    classDef actionNode fill:#f8fafc,stroke:#64748b,stroke-width:1.5px,color:#1e293b;
    classDef approveNode fill:#f0fdf4,stroke:#22c55e,stroke-width:1.5px,color:#14532d;
    classDef rejectNode fill:#fef2f2,stroke:#ef4444,stroke-width:1.5px,color:#991b1b;

    class Start,End startEnd;
    class AdminDashboard mainNode;
    class SelectMenu,UserAction,LTAction,NeedAction,DecideLeave decision;
    class UserMgmt,AddUser,SaveUser,EditUser,UpdateUser,ChangeRole,UpdateRole,DeleteUser,RemoveUser actionNode;
    class LeaveTypeMgmt,AddLT,SaveLT,EditLT,UpdateLT,DeleteLT,RemoveLT,LeaveOverview,FilterLeave,ViewDetail,EditProfile,Logout actionNode;
    class ApproveLeave approveNode;
    class RejectLeave rejectNode;
```

---

## 2. คำอธิบายหน้าที่และกระบวนการทำงานหลัก (Admin Capabilities)

### 2.1 การจัดการข้อมูลผู้ใช้งาน (User Management)
- **เพิ่มผู้ใช้ใหม่**: กำหนดชื่อ-นามสกุล อีเมล รหัสผ่านเริ่มต้น เลือกระดับบทบาท (`Employee`, `Manager`, `Admin`) และเลือกสังกัดแผนก/ฝ่าย
- **แก้ไขข้อมูล**: สามารถอัปเดตข้อมูลทั่วไปของพนักงาน รวมถึงการรีเซ็ตรหัสผ่านและการย้ายแผนก
- **การปรับเปลี่ยนบทบาท (Role Change)**: สามารถปรับเปลี่ยนระดับสิทธิ์ของพนักงานได้ตามโครงสร้างองค์กร (มีกลไกป้องกันไม่ให้ผู้ดูแลระบบปลดสิทธิ์ตนเองโดยไม่ตั้งใจ)
- **การลบผู้ใช้**: ลบบัญชีผู้ใช้ที่พ้นสภาพ (มีกลไกป้องกันการลบบัญชีตนเอง)

### 2.2 การจัดการประเภทการลา (Leave Types Management)
- **กำหนดประเภทการลา**: เช่น ลาป่วย, ลากิจ, ลาพักร้อน, ลาคลอด
- **กำหนดเพดานวันลาสูงสุด**: กำหนดจำนวนวันลาสูงสุดต่อปี (`max_days`) สำหรับแต่ละประเภทการลา เพื่อใช้เป็นเกณฑ์อ้างอิงในการยื่นคำขอ
- **แก้ไขและปรับปรุง**: ปรับปรุงชื่อประเภทการลาและวันลาสูงสุดให้สอดคล้องกับระเบียบองค์กร

### 2.3 การตรวจสอบแดชบอร์ดภาพรวมการลา (Leave Overview & Approval)
- ผู้ดูแลระบบสามารถมองเห็นใบลาของบุคลากรทุกคนในทุกแผนก
- มีระบบค้นหาและตัวกรองตามสถานะ (รออนุมัติ, อนุมัติแล้ว, ปฏิเสธ)
- ผู้ดูแลระบบมีอำนาจในการพิจารณาอนุมัติหรือปฏิเสธคำขอลาได้โดยตรงในกรณีจำเป็นเร่งด่วน
