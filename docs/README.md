# เอกสารผังงานระบบและ Use Case Diagram (LeaveSystem Documentation)

ยินดีต้อนรับสู่ชุดเอกสารวิเคราะห์และออกแบบกระบวนการทำงานของระบบ **LeaveSystem (ระบบบริหารจัดการการลา / E-Leave)** ซึ่งพัฒนาขึ้นเพื่อใช้เป็นเอกสารอ้างอิงทางเทคนิค สื่อประกอบการนำเสนอ และคู่มือแสดงกระบวนการทำงานของระบบ

---

## 📑 สารบัญเอกสาร (Table of Contents)

เอกสารทั้งหมดถูกจัดเรียงตามลำดับกระบวนการทำงานจริงในระบบ ดังนี้:

| ลำดับ | รายการเอกสาร | หัวข้อหลัก | ไฟล์เอกสาร |
| :---: | :--- | :--- | :--- |
| 1 | **ผังงานระบบการเข้าสู่ระบบ** | Login & Authentication Flow, การตรวจสอบความถูกต้อง, การแยกหน้าตามบทบาท (RBAC) | [1-login-flow.md](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/1-login-flow.md) |
| 2 | **ผังงานกระบวนการของผู้ดูแลระบบ** | Admin Flow, การจัดการผู้ใช้, การจัดการประเภทการลา, การจัดการแผนก, แดชบอร์ดภาพรวม | [2-admin-flow.md](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/2-admin-flow.md) |
| 3 | **ผังงานกระบวนการของผู้ใช้งานระดับ 1** | User Level 1 Flow (พนักงานทั่วไป / Employee), การสร้างใบลา, ติดตามสถานะ, ยกเลิกคำขอ | [3-user-level-1-flow.md](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/3-user-level-1-flow.md) |
| 4 | **ผังงานกระบวนการของผู้ใช้งานระดับ 2** | User Level 2 Flow (ผู้จัดการฝ่าย / Manager), การตรวจสอบใบลา, การอนุมัติ, การปฏิเสธพร้อมระบุเหตุผล | [4-user-level-2-flow.md](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/4-user-level-2-flow.md) |
| 5 | **ผังภาพรวมของระบบทั้งหมด** | System Overview Use Case Diagram, ความสัมพันธ์ Actors กับ Use Cases, `<<include>>`, `<<extend>>` | [5-usecase-diagram.md](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/5-usecase-diagram.md) |
| 6 | **เอกสารการออกแบบ RESTful API** | API Specifications, Method, Parameters (Query, Path, Body, File), Status Codes, JWT Security | [API_DOCUMENTATION.md](file:///c:/Users/KUY/Desktop/Vecskill/LeaveSystem/docs/API_DOCUMENTATION.md) |

---

## 👥 โครงสร้างบทบาทผู้ใช้งานในระบบ (System User Roles)

ระบบ LeaveSystem มีการแบ่งระดับผู้ใช้งานและสิทธิ์การเข้าถึงออกเป็น 3 ระดับหลัก:

1. **ผู้ใช้งานระดับ 1 (Employee / พนักงานทั่วไป)**
   - สิทธิ์ในฐานข้อมูล: `role = 'employee'`
   - สิทธิ์การทำงาน: ยื่นใบลาใหม่ แนบไฟล์หลักฐาน ติดตามสถานะใบลา ยกเลิกใบลาที่รออนุมัติ จัดการโปรไฟล์ส่วนตัว
2. **ผู้ใช้งานระดับ 2 (Manager / ผู้จัดการฝ่าย / ผู้อนุมัติ)**
   - สิทธิ์ในฐานข้อมูล: `role = 'manager'`
   - สิทธิ์การทำงาน: ตรวจสอบคำขอลาของพนักงานในสังกัด ตรวจสอบไฟล์แนบ อนุมัติใบลา ปฏิเสธใบลา (บังคับระบุเหตุผล)
3. **ผู้ดูแลระบบ (Admin)**
   - สิทธิ์ในฐานข้อมูล: `role = 'admin'`
   - สิทธิ์การทำงาน: ครอบคลุมการทำงานทุกส่วน จัดการผู้ใช้งาน กำหนดสิทธิ์/เปลี่ยนบทบาท จัดการประเภทการลาและวันลาสูงสุด จัดการแผนก ตรวจสอบภาพรวมทั้งองค์กร

---

## 💡 วิธีการนำไดอะแกรมไปใช้งาน
- เอกสารทุกไฟล์ใช้มาตรฐาน **Mermaid Diagram** ซึ่งสามารถเรนเดอร์แสดงผลอัตโนมัติบน GitLab, GitHub, VS Code (ติดตั้งส่วนขยาย Markdown Preview Mermaid Support) หรือนำโค้ด Mermaid ไปเปิดบน [Mermaid Live Editor](https://mermaid.live/) เพื่อบันทึกเป็นรูปภาพ SVG หรือ PNG ความละเอียดสูงสำหรับประกอบเล่มรายงานได้ทันที
