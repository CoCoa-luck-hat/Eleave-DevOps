# ผังงานกระบวนการของผู้ใช้งานระดับ 2 (User Level 2 Flow: ผู้จัดการฝ่าย / Manager)

เอกสารนี้แสดงผังงานกระบวนการทำงานของผู้ใช้งานระดับ 2 ซึ่งมีบทบาทเป็นหัวหน้างานหรือผู้จัดการฝ่าย (`role: manager`) ในระบบ **LeaveSystem (ระบบบริหารจัดการการลา)** โดยมีหน้าที่หลักในการตรวจสอบ พิจารณา และอนุมัติหรือปฏิเสธคำขอลาของบุคลากร

---

## 1. แผนภาพผังงาน (Flowchart)

```mermaid
flowchart TD
    Start(["เริ่มต้น: เข้าสู่ระบบสำเร็จด้วยสิทธิ์ Manager"]) --> ManagerDashboard["เข้าสู่หน้าแดชบอร์ดผู้จัดการ (/manager)"]
    
    ManagerDashboard --> DashboardActions{"เลือกกิจกรรมบนแดชบอร์ด"}
    
    %% การค้นหาและตรวจสอบรายการ
    DashboardActions -- "ตรวจสอบรายการคำขอลา" --> BrowseRequests["เรียกดูรายการคำขอลาของพนักงาน"]
    BrowseRequests --> FilterSearch["ค้นหาด้วยชื่อพนักงาน / กรองตามสถานะ (รออนุมัติ, อนุมัติแล้ว, ปฏิเสธ)"]
    FilterSearch --> SelectRequest["เลือกรายการคำขอลาที่ต้องการตรวจสอบ"]
    
    SelectRequest --> ViewDetail["เปิดหน้าต่างดูรายละเอียดคำขอ (ชื่อผู้ขอ, แผนก, ประเภทลา, ช่วงวันที่, เหตุผล)"]
    ViewDetail --> CheckAttachment{"มีเอกสารแนบหรือไม่?"}
    CheckAttachment -- "มีเอกสารแนบ" --> InspectFile["คลิกเปิดดู / ดาวน์โหลดเอกสารหลักฐาน (เช่น ใบรับรองแพทย์)"] --> CheckStatus
    CheckAttachment -- "ไม่มีเอกสารแนบ" --> CheckStatus{"ตรวจสอบสถานะของคำขอ"}
    
    %% การพิจารณาอนุมัติ / ปฏิเสธ
    CheckStatus -- "สถานะ = ได้รับการพิจารณาแล้ว (Approved / Rejected)" --> ViewOnly["ดูข้อมูลประวัติได้อย่างเดียว (ไม่สามารถแก้ไขผลการพิจารณาซ้ำได้)"] --> ManagerDashboard
    CheckStatus -- "สถานะ = รออนุมัติ (Pending)" --> DecideAction{"การตัดสินใจพิจารณา"}
    
    %% กรณีอนุมัติ
    DecideAction -- "อนุมัติคำขอ (Approve)" --> ConfirmApprove{"ยืนยันการอนุมัติคำขอลา?"}
    ConfirmApprove -- "ยืนยัน" --> ProcessApprove["ระบบปรับปรุงสถานะเป็น 'อนุมัติแล้ว (Approved)'"]
    ConfirmApprove -- "ยกเลิก" --> ViewDetail
    ProcessApprove --> SuccessApprove["แสดงข้อความ 'อนุมัติใบลาสำเร็จ'<br/>และอัปเดตหน้าจอทันที"] --> ManagerDashboard
    
    %% กรณีปฏิเสธ
    DecideAction -- "ปฏิเสธคำขอ (Reject)" --> OpenRejectModal["เปิดหน้าต่างระบุเหตุผลการปฏิเสธ (Reject Modal)"]
    OpenRejectModal --> InputRejectReason["ผู้จัดการกรอกเหตุผลที่ไม่อนุมัติ (เช่น งานเร่งด่วน / วันลาซ้อนทับ)"]
    InputRejectReason --> ValidateReason{"ตรวจสอบการกรอกเหตุผล"}
    ValidateReason -- "ไม่ได้ระบุเหตุผล" --> ShowReasonWarning["แจ้งเตือน: กรุณาระบุเหตุผลในการปฏิเสธ"] --> InputRejectReason
    ValidateReason -- "ระบุเหตุผลครบถ้วน" --> ProcessReject["ระบบบันทึกเหตุผลการปฏิเสธ (Reject Reason)<br/>และปรับปรุงสถานะเป็น 'ปฏิเสธ (Rejected)'"]
    ProcessReject --> SuccessReject["แสดงข้อความ 'ปฏิเสธใบลาสำเร็จ'<br/>และอัปเดตหน้าจอทันที"] --> ManagerDashboard

    %% การจัดการส่วนตัวและออกจากระบบ
    DashboardActions -- "จัดการโปรไฟล์ส่วนตัว" --> ProfileModal["เปิดหน้าต่างจัดการข้อมูลส่วนตัว / เปลี่ยนรหัสผ่าน / รูปโปรไฟล์"] --> ManagerDashboard
    DashboardActions -- "ออกจากระบบ" --> Logout["ล้างข้อมูลเซสชัน (Token) และกลับสู่หน้า Login"]
    Logout --> End(["สิ้นสุดกระบวนการ"])

    classDef startEnd fill:#0f766e,stroke:#115e59,stroke-width:2px,color:#ffffff;
    classDef mainNode fill:#7c3aed,stroke:#6d28d9,stroke-width:1.5px,color:#ffffff;
    classDef decision fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a8a;
    classDef actionNode fill:#f8fafc,stroke:#64748b,stroke-width:1.5px,color:#1e293b;
    classDef approveNode fill:#f0fdf4,stroke:#22c55e,stroke-width:1.5px,color:#14532d;
    classDef rejectNode fill:#fef2f2,stroke:#ef4444,stroke-width:1.5px,color:#991b1b;
    classDef warningNode fill:#fffbeb,stroke:#f59e0b,stroke-width:1.5px,color:#78350f;

    class Start,End startEnd;
    class ManagerDashboard mainNode;
    class DashboardActions,CheckAttachment,CheckStatus,DecideAction,ConfirmApprove,ValidateReason decision;
    class BrowseRequests,FilterSearch,SelectRequest,ViewDetail,InspectFile,ViewOnly,OpenRejectModal,InputRejectReason,ProfileModal,Logout actionNode;
    class ProcessApprove,SuccessApprove approveNode;
    class ProcessReject,SuccessReject rejectNode;
    class ShowReasonWarning warningNode;
```

---

## 2. คำอธิบายขั้นตอนการทำงาน (Process Steps)

### 2.1 การตรวจสอบข้อมูลคำขอลา (Review Process)
1. ผู้จัดการเข้าสู่หน้าแดชบอร์ด (`/manager`) จะพบรายการคำขอลาของพนักงานทั้งหมดในระบบ
2. สามารถใช้แถบค้นหาเพื่อพิมพ์ค้นหาตามชื่อพนักงาน, อีเมล, ประเภทการลา หรือเลือกกรองเฉพาะรายการที่อยู่ในสถานะ **"รออนุมัติ (Pending)"** ได้
3. ผู้จัดการสามารถกดปุ่ม **"รายละเอียด"** เพื่อเปิดดูข้อมูลคำขอฉบับเต็ม รวมถึงดาวน์โหลดหรือเปิดดูเอกสารแนบหลักฐาน (เช่น ใบรับรองแพทย์) ก่อนตัดสินใจ

### 2.2 เกณฑ์การตัดสินใจพิจารณาคำขอลา (Approval Workflow)
- **กรณีอนุมัติ (Approved)**:
  - ใช้สำหรับคำขอที่มีเหตุผลสมควร วันลาไม่ขัดต่อระเบียบ และมีเอกสารประกอบถูกต้องครบถ้วน
  - เมื่อผู้จัดการกดยืนยันอนุมัติ สถานะของคำขอจะเปลี่ยนเป็น `approved` ทันที และพนักงานจะเห็นการอัปเดตสถานะในหน้าประวัติของตนเอง
- **กรณีปฏิเสธ (Rejected)**:
  - ใช้ในกรณีที่เอกสารไม่สมบูรณ์ หรือติดภารกิจสำคัญที่ไม่สามารถหยุดงานได้
  - **ข้อกำหนดสำคัญ**: ระบบบังคับให้ผู้จัดการต้องกรอก **"เหตุผลในการปฏิเสธ"** เสมอ เพื่อให้พนักงานผู้ยื่นคำขอรับทราบเหตุผลอย่างโปร่งใส
  - เมื่อบันทึกเรียบร้อย สถานะจะเปลี่ยนเป็น `rejected` พร้อมแนบข้อความเหตุผลให้พนักงานเปิดอ่านได้ในหน้าประวัติการลา
