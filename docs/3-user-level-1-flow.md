# ผังงานกระบวนการของผู้ใช้งานระดับ 1 (User Level 1 Flow: พนักงานทั่วไป / Employee)

เอกสารนี้แสดงผังงานกระบวนการทำงานของผู้ใช้งานระดับ 1 ซึ่งเป็นพนักงานทั่วไป (`role: employee`) ในระบบ **LeaveSystem (ระบบบริหารจัดการการลา)** ครอบคลุมการตรวจสอบประวัติการลา การสร้างและยื่นคำขอลาใหม่ การติดตามสถานะ และการจัดการคำขอลา

---

## 1. แผนภาพผังงาน (Flowchart)

```mermaid
flowchart TD
    Start(["เริ่มต้น: เข้าสู่ระบบสำเร็จด้วยสิทธิ์ Employee"]) --> UserDashboard["เข้าสู่หน้าประวัติการลา (/user)"]
    
    UserDashboard --> MainAction{"เลือกการดำเนินการ"}
    
    %% เส้นทาง 1: ยื่นใบลาใหม่
    MainAction -- "สร้างใบลาใหม่" --> CreatePage["เข้าสู่หน้าแบบฟอร์มขอลา (/user/create-leave)"]
    CreatePage --> FillForm["1. เลือกประเภทการลา (ลาป่วย/ลากิจ/ลาคลอด)<br/>2. เลือกวันที่เริ่มต้น และวันที่สิ้นสุดการลา<br/>3. ตรวจสอบการคำนวณจำนวนวันลา<br/>4. กรอกเหตุผลการลา"]
    FillForm --> HasFile{"มีเอกสารแนบหรือไม่?<br/>(เช่น ใบรับรองแพทย์)"}
    HasFile -- "มี" --> UploadFile["อัปโหลดไฟล์เอกสาร (PDF หรือ รูปภาพ)"] --> ValidateForm
    HasFile -- "ไม่มี" --> ValidateForm{"ตรวจสอบความถูกต้อง<br/>ของข้อมูลในแบบฟอร์ม"}
    
    ValidateForm -- "ข้อมูลไม่ครบถ้วน / วันที่ไม่ถูกต้อง" --> ShowFormError["แสดงข้อความเตือนให้แก้ไขข้อมูล"] --> FillForm
    ValidateForm -- "ข้อมูลถูกต้องครบถ้วน" --> SubmitLeave["กดยืนยัน 'ยื่นใบลา'"]
    SubmitLeave --> SaveLeaveSuccess["ระบบบันทึกข้อมูลคำขอลา<br/>กำหนดสถานะเริ่มต้นเป็น 'รออนุมัติ (Pending)'"]
    SaveLeaveSuccess --> BackToDashboard["นำทางกลับไปยังหน้ารายการประวัติการลา"] --> UserDashboard

    %% เส้นทาง 2: ตรวจสอบและติดตามประวัติการลา
    MainAction -- "ดูประวัติและติดตามสถานะ" --> ViewHistory["ดูรายการคำขอลาทั้งหมดของตนเอง"]
    ViewHistory --> FilterSearch["ค้นหาคำขอ / กรองตามสถานะ (รออนุมัติ, อนุมัติแล้ว, ปฏิเสธ)"]
    FilterSearch --> ClickDetail["กดปุ่ม 'รายละเอียด' เพื่อดูข้อมูลเชิงลึก"]
    ClickDetail --> ShowDetailModal["แสดงข้อมูล: ช่วงเวลาลา, จำนวนวัน, เอกสารแนบ<br/>และเหตุผลการปฏิเสธ (กรณีถูกปฏิเสธ)"]
    ShowDetailModal --> CloseModal["ปิดหน้าต่างรายละเอียด"] --> UserDashboard

    %% เส้นทาง 3: การยกเลิก/ลบคำขอลา
    MainAction -- "ยกเลิกคำขอลา" --> CheckLeaveStatus{"ตรวจสอบสถานะ<br/>ของคำขอลา"}
    CheckLeaveStatus -- "สถานะ = รออนุมัติ (Pending)" --> ConfirmDelete{"ผู้ใช้ยืนยันการยกเลิกคำขอ?"}
    ConfirmDelete -- "ยืนยัน" --> DeletePendingLeave["ระบบลบคำขอลาออกจากระบบสำเร็จ"] --> UserDashboard
    ConfirmDelete -- "ยกเลิก" --> UserDashboard
    CheckLeaveStatus -- "สถานะ = อนุมัติแล้ว / ปฏิเสธ" --> CannotDelete["ระบบล็อกข้อมูล ไม่อนุญาตให้ลบหรือแก้ไข"] --> UserDashboard

    %% เส้นทาง 4: จัดการโปรไฟล์ และ ออกจากระบบ
    MainAction -- "จัดการโปรไฟล์ส่วนตัว" --> ProfileModal["เปิดหน้าต่างโปรไฟล์: แก้ไขชื่อ, เปลี่ยนรหัสผ่าน หรืออัปโหลดรูปภาพ"]
    ProfileModal --> UpdateProfile["บันทึกข้อมูลส่วนตัว"] --> UserDashboard
    MainAction -- "ออกจากระบบ" --> Logout["ล้างข้อมูลเซสชัน (Token) และกลับสู่หน้า Login"]
    Logout --> End(["สิ้นสุดกระบวนการ"])

    classDef startEnd fill:#0f766e,stroke:#115e59,stroke-width:2px,color:#ffffff;
    classDef mainNode fill:#0d9488,stroke:#0f766e,stroke-width:1.5px,color:#ffffff;
    classDef decision fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a8a;
    classDef actionNode fill:#f8fafc,stroke:#64748b,stroke-width:1.5px,color:#1e293b;
    classDef successNode fill:#f0fdf4,stroke:#22c55e,stroke-width:1.5px,color:#14532d;
    classDef errorNode fill:#fef2f2,stroke:#ef4444,stroke-width:1.5px,color:#991b1b;

    class Start,End startEnd;
    class UserDashboard,CreatePage mainNode;
    class MainAction,HasFile,ValidateForm,CheckLeaveStatus,ConfirmDelete decision;
    class FillForm,UploadFile,SubmitLeave,ViewHistory,FilterSearch,ClickDetail,ShowDetailModal,CloseModal,DeletePendingLeave,ProfileModal,UpdateProfile,Logout,BackToDashboard actionNode;
    class SaveLeaveSuccess successNode;
    class ShowFormError,CannotDelete errorNode;
```

---

## 2. คำอธิบายขั้นตอนการทำงาน (Process Steps)

### 2.1 การยื่นใบลาใหม่ (Leave Submission Flow)
1. พนักงานเข้าสู่หน้าสร้างใบลาใหม่ (`/user/create-leave`)
2. เลือก **ประเภทการลา** จากรายการที่องค์กรกำหนด (เช่น ลาป่วย, ลากิจ, ลาคลอด)
3. กำหนด **วันที่เริ่มต้น** และ **วันที่สิ้นสุด** โดยระบบจะคำนวณจำนวนวันลาให้อัตโนมัติ
4. ระบุ **เหตุผลการขอลา** เพื่อให้หัวหน้างานใช้ประกอบการพิจารณา
5. กรณีมีเอกสารหลักฐาน เช่น ใบรับรองแพทย์ หรือหนังสือราชการ สามารถแนบไฟล์ในรูปแบบภาพหรือ PDF ได้
6. เมื่อกดยื่นใบลา ข้อมูลจะถูกจัดเก็บเข้าสู่ระบบด้วยสถานะ **"รออนุมัติ (Pending)"** เพื่อรอการพิจารณาจากผู้จัดการฝ่าย

### 2.2 การติดตามสถานะและการจัดการคำขอลา (Tracking & Management)
- **การติดตามสถานะ**: พนักงานสามารถดูสถานะของแต่ละคำขอได้ทันทีผ่านสัญลักษณ์ Badge สถานะ:
  - 🟡 **รออนุมัติ (Pending)**: อยู่ระหว่างรอหัวหน้างานตรวจสอบ
  - 🟢 **อนุมัติแล้ว (Approved)**: ได้รับการอนุมัติเรียบร้อยแล้ว
  - 🔴 **ปฏิเสธ (Rejected)**: ไม่ได้รับการอนุมัติ โดยพนักงานสามารถกดดู "รายละเอียด" เพื่ออ่านเหตุผลที่หัวหน้างานระบุได้
- **เงื่อนไขการยกเลิก/ลบคำขอลา**:
  - สามารถลบคำขอได้ **เฉพาะในกรณีที่สถานะยังเป็น "รออนุมัติ (Pending)" เท่านั้น**
  - หากได้รับการอนุมัติหรือปฏิเสธแล้ว ระบบจะไม่อนุญาตให้แก้ไขหรือลบ เพื่อรักษาความถูกต้องของประวัติการลา
