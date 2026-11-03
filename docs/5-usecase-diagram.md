# ผังภาพรวมของระบบทั้งหมด (Use Case Diagram)

เอกสารนี้แสดงภาพรวมการทำงานทั้งหมดของระบบ **LeaveSystem (ระบบบริหารจัดการการลา)** ในรูปแบบ Use Case Diagram ตามมาตรฐานวิศวกรรมซอฟต์แวร์ เพื่อแสดงความสัมพันธ์ระหว่างผู้ใช้งานกลุ่มต่างๆ (Actors) กับฟังก์ชันการทำงานภายในระบบ (Use Cases) พร้อมทั้งระบุความสัมพันธ์ `<<include>>` และ `<<extend>>`

---

## 1. แผนภาพ Use Case Diagram

```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["ผู้มีส่วนได้ส่วนเสีย (Actors)"]
        direction TB
        Employee["🧑 ผู้ใช้งานระดับ 1<br/>(พนักงานทั่วไป / Employee)"]
        Manager["👨‍💼 ผู้ใช้งานระดับ 2<br/>(ผู้จัดการฝ่าย / Manager)"]
        Admin["🛠️ ผู้ดูแลระบบ<br/>(Admin)"]
    end

    %% System Boundary
    subgraph System ["ขอบเขตระบบ: ระบบบริหารจัดการการลา (LeaveSystem)"]
        direction TB
        
        %% กลุ่มที่ 1: ระบบยืนยันตัวตนและบัญชีผู้ใช้
        subgraph GroupAuth ["1. ระบบยืนยันตัวตนและการเข้าใช้งาน"]
            UC_Login(["เข้าสู่ระบบ<br/>(Login)"])
            UC_VerifyRole(["ตรวจสอบความถูกต้องและแยกสิทธิ์<br/>(Verify Credentials & RBAC)"])
            UC_Logout(["ออกจากระบบ<br/>(Logout)"])
        end
        
        %% กลุ่มที่ 2: โมดูลการลาสำหรับพนักงาน
        subgraph GroupLeave ["2. การยื่นและติดตามคำขอลา (พนักงาน)"]
            UC_CreateLeave(["ยื่นคำขอลาใหม่<br/>(Submit Leave Request)"])
            UC_UploadDoc(["แนบเอกสารหลักฐานประกอบ<br/>(Attach Supporting Doc)"])
            UC_ViewHistory(["ตรวจสอบประวัติและสถานะการลา<br/>(View Leave History)"])
            UC_EditLeave(["แก้ไขคำขอลาที่รอการอนุมัติ<br/>(Edit Pending Leave)"])
            UC_CancelLeave(["ยกเลิกคำขอลาที่รอการอนุมัติ<br/>(Cancel Pending Leave)"])
        end

        %% กลุ่มที่ 3: โมดูลการพิจารณาคำขอลา
        subgraph GroupApproval ["3. การพิจารณาและอนุมัติคำขอลา (หัวหน้างาน / ผู้ดูแล)"]
            UC_ReviewLeave(["เรียกดูและค้นหาคำขอลาพนักงาน<br/>(Review Leave Requests)"])
            UC_InspectDoc(["เปิดตรวจสอบเอกสารแนบหลักฐาน<br/>(Inspect Attachment)"])
            UC_ApproveLeave(["อนุมัติคำขอลา<br/>(Approve Leave Request)"])
            UC_RejectLeave(["ปฏิเสธคำขอลา<br/>(Reject Leave Request)"])
            UC_RejectReason(["ระบุเหตุผลในการปฏิเสธ<br/>(Specify Rejection Reason)"])
        end

        %% กลุ่มที่ 4: โมดูลบริหารจัดการระบบ
        subgraph GroupAdmin ["4. การดูแลระบบและข้อมูลหลัก (ผู้ดูแลระบบ)"]
            UC_Dashboard(["ตรวจสอบแดชบอร์ดภาพรวมระบบ<br/>(System Overview Dashboard)"])
            UC_ManageLeaveTypes(["จัดการประเภทการลาและวันลาสูงสุด<br/>(Manage Leave Types)"])
            UC_ManageGroups(["จัดการแผนก/ฝ่ายสังกัด<br/>(Manage Groups/Depts)"])
        end
    end

    %% ความสัมพันธ์: Actor -> Use Cases
    Employee --- UC_Login
    Employee --- UC_Logout
    Employee --- UC_CreateLeave
    Employee --- UC_ViewHistory
    Employee --- UC_EditLeave
    Employee --- UC_CancelLeave

    Manager --- UC_Login
    Manager --- UC_Logout
    Manager --- UC_ReviewLeave
    Manager --- UC_ApproveLeave
    Manager --- UC_RejectLeave

    Admin --- UC_Login
    Admin --- UC_Logout
    Admin --- UC_Dashboard
    Admin --- UC_ManageLeaveTypes
    Admin --- UC_ManageGroups
    Admin --- UC_ApproveLeave
    Admin --- UC_RejectLeave

    %% ความสัมพันธ์พิเศษ: include & extend
    UC_Login -. "<<include>>" .-> UC_VerifyRole
    UC_UploadDoc -. "<<extend>>" .-> UC_CreateLeave
    UC_InspectDoc -. "<<extend>>" .-> UC_ReviewLeave
    UC_RejectLeave -. "<<include>>" .-> UC_RejectReason

    classDef actorStyle fill:#f8fafc,stroke:#334155,stroke-width:2px,color:#0f172a,font-weight:bold;
    classDef usecaseStyle fill:#ffffff,stroke:#0284c7,stroke-width:1.5px,color:#0369a1;
    classDef incExtStyle fill:#fefce8,stroke:#ca8a04,stroke-width:1.5px,stroke-dasharray: 4 4,color:#854d0e;

    class Employee,Manager,Admin actorStyle;
    class UC_Login,UC_Logout,UC_CreateLeave,UC_ViewHistory,UC_EditLeave,UC_CancelLeave,UC_ReviewLeave,UC_ApproveLeave,UC_RejectLeave,UC_Dashboard,UC_ManageLeaveTypes,UC_ManageGroups usecaseStyle;
    class UC_VerifyRole,UC_UploadDoc,UC_InspectDoc,UC_RejectReason incExtStyle;
```

---

## 2. ตารางสรุปรายละเอียด Use Cases (Use Case Descriptions)

### 2.1 นิยามผู้ใช้งาน (Actors Definition)
| Actor | บทบาทในระบบ | สิทธิ์และหน้าที่หลัก |
| :--- | :--- | :--- |
| **ผู้ใช้งานระดับ 1 (พนักงานทั่วไป / Employee)** | พนักงานผู้ปฏิบัติงาน | ยื่นใบลาใหม่, ติดตามสถานะคำขอลา, ตรวจสอบประวัติการลา, แก้ไขใบลาที่รออนุมัติ, ยกเลิกใบลาที่รออนุมัติ |
| **ผู้ใช้งานระดับ 2 (ผู้จัดการฝ่าย / Manager)** | หัวหน้างาน / ผู้มีอำนาจอนุมัติ | ตรวจสอบรายการคำขอลาของพนักงาน, ตรวจสอบเอกสารแนบ, พิจารณาอนุมัติหรือปฏิเสธพร้อมระบุเหตุผล |
| **ผู้ดูแลระบบ (Admin)** | ผู้ดูแลระบบสารสนเทศ | จัดการประเภทการลาและโควตาวันลา, จัดการแผนก, ดูแลภาพรวมและพิจารณาคำขอลา |

---

### 2.2 รายละเอียด Use Case และความสัมพันธ์
| รหัส | ชื่อ Use Case | ผู้ใช้งาน (Actor) | ความสัมพันธ์ (Relationship) | คำอธิบายสั้น |
| :--- | :--- | :--- | :--- | :--- |
| **UC01** | เข้าสู่ระบบ (Login) | ทุก Actor | `<<include>>` UC02 | เข้าใช้งานระบบด้วยอีเมลและรหัสผ่าน |
| **UC02** | ตรวจสอบความถูกต้องและแยกสิทธิ์ (Verify & RBAC) | ระบบ (System) | Included ใน UC01 | ตรวจสอบข้อมูลในฐานข้อมูลและนำทางไปยังหน้าตามบทบาท |
| **UC03** | ออกจากระบบ (Logout) | ทุก Actor | - | ล้างเซสชันการเข้าใช้งานและกลับสู่หน้า Login |
| **UC04** | ยื่นคำขอลาใหม่ (Submit Leave Request) | Employee | Extended โดย UC05 | กรอกแบบฟอร์มเลือกประเภทลา ระบุช่วงเวลา และเหตุผล |
| **UC05** | แนบเอกสารหลักฐาน (Attach Supporting Doc) | Employee | `<<extend>>` ไปยัง UC04 | อัปโหลดไฟล์ภาพหรือ PDF ประกอบการลา เช่น ใบรับรองแพทย์ |
| **UC06** | ตรวจสอบประวัติและสถานะการลา (View History) | Employee | - | ดูรายการใบลาของตนเอง พร้อมสถานะ Pending, Approved, Rejected |
| **UC07** | แก้ไขคำขอลาที่รออนุมัติ (Edit Pending Leave) | Employee | - | ปรับปรุงข้อมูลคำขอลา วันที่ เหตุผล หรือเอกสารแนบ (เฉพาะสถานะ Pending) |
| **UC08** | ยกเลิกคำขอลาที่รออนุมัติ (Cancel Pending Leave) | Employee | - | ขอยกเลิกคำขอลาที่ยังไม่ผ่านการพิจารณาจากหัวหน้า |
| **UC09** | เรียกดูและค้นหาคำขอลา (Review Leave Requests) | Manager, Admin | Extended โดย UC10 | ดูรายการคำขอลาทั้งหมด กรองตามสถานะ และค้นหาตามชื่อ |
| **UC10** | ตรวจสอบเอกสารแนบ (Inspect Attachment) | Manager, Admin | `<<extend>>` ไปยัง UC09 | เปิดดูหรือดาวน์โหลดเอกสารหลักฐานของพนักงาน |
| **UC11** | อนุมัติคำขอลา (Approve Leave Request) | Manager, Admin | - | ปรับเปลี่ยนสถานะคำขอลาเป็นอนุมัติแล้ว |
| **UC12** | ปฏิเสธคำขอลา (Reject Leave Request) | Manager, Admin | `<<include>>` UC13 | ปรับเปลี่ยนสถานะคำขอลาเป็นปฏิเสธคำขอ |
| **UC13** | ระบุเหตุผลในการปฏิเสธ (Specify Rejection Reason) | Manager, Admin | Included ใน UC12 | บังคับระบุข้อความเหตุผลให้พนักงานทราบเมื่อไม่อนุมัติ |
| **UC14** | ตรวจสอบแดชบอร์ดภาพรวม (System Dashboard) | Admin | - | ดูสถิติและสถานะคำขอลาทั้งหมดของทุกแผนกในองค์กร |
| **UC15** | จัดการประเภทการลา (Manage Leave Types) | Admin | - | เพิ่ม ลบ แก้ไขชื่อประเภทการลา และกำหนดเพดานวันลาสูงสุด |
| **UC16** | จัดการแผนก/ฝ่าย (Manage Groups) | Admin | - | เพิ่ม ลบ แก้ไขข้อมูลโครงสร้างแผนกในองค์กร |
