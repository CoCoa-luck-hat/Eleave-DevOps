const express = require("express");
const router = express.Router();
const { pool } = require("../Database/connectMysql");
const { allowOnlyAdmin } = require("../Controllers/Role");
const { VerifyToken } = require("../Middleware/VerifyToken");

// api ดึงรายการประเภทการลาทั้งหมด
router.get("/leave-types", VerifyToken, async (req, res) => {
  try {
    const [row] = await pool.execute(
      "SELECT * FROM leave_types ORDER BY leave_type_name"
    );
    return res.status(200).json({
      leaveTypes: row,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api เพิ่มประเภทการลา (Admin only)
router.post("/leave-types", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const { leave_type_name, max_days } = req.body;

    if (!leave_type_name || leave_type_name.trim() === "") {
      return res.status(400).json({
        message: "กรุณากรอกชื่อประเภทการลา",
      });
    }

    const trimmedName = leave_type_name.trim();
    const maxDays = max_days !== undefined && max_days !== null && max_days !== ""
      ? parseInt(max_days, 10)
      : 30;

    const [existing] = await pool.execute(
      "SELECT leave_type_id FROM leave_types WHERE leave_type_name = ?",
      [trimmedName]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "ชื่อประเภทการลานี้มีอยู่แล้ว",
      });
    }

    await pool.execute(
      "INSERT INTO leave_types (leave_type_name, max_days) VALUES (?, ?)",
      [trimmedName, maxDays]
    );

    res.status(201).json({
      message: "เพิ่มประเภทการลาสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api แก้ไขประเภทการลา (Admin only)
router.put("/leave-types/:id", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { leave_type_name, max_days } = req.body;

    if (!leave_type_name || leave_type_name.trim() === "") {
      return res.status(400).json({
        message: "กรุณากรอกชื่อประเภทการลา",
      });
    }

    const trimmedName = leave_type_name.trim();

    const [leaveType] = await pool.execute(
      "SELECT leave_type_id FROM leave_types WHERE leave_type_id = ?",
      [id]
    );

    if (leaveType.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลประเภทการลา",
      });
    }

    const [existing] = await pool.execute(
      "SELECT leave_type_id FROM leave_types WHERE leave_type_name = ? AND leave_type_id != ?",
      [trimmedName, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "ชื่อประเภทการลานี้มีอยู่แล้ว",
      });
    }

    if (max_days !== undefined && max_days !== null && max_days !== "") {
      const parsedMaxDays = parseInt(max_days, 10);
      await pool.execute(
        "UPDATE leave_types SET leave_type_name = ?, max_days = ? WHERE leave_type_id = ?",
        [trimmedName, parsedMaxDays, id]
      );
    } else {
      await pool.execute(
        "UPDATE leave_types SET leave_type_name = ? WHERE leave_type_id = ?",
        [trimmedName, id]
      );
    }

    res.status(200).json({
      message: "แก้ไขประเภทการลาสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api ลบประเภทการลา (Admin only)
router.delete("/leave-types/:id", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const [leaveType] = await pool.execute(
      "SELECT leave_type_id FROM leave_types WHERE leave_type_id = ?",
      [id]
    );

    if (leaveType.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลประเภทการลา",
      });
    }

    const [reports] = await pool.execute(
      "SELECT report_id FROM reports WHERE leave_type_id = ?",
      [id]
    );

    if (reports.length > 0) {
      return res.status(400).json({
        message: "ไม่สามารถลบประเภทการลานี้ได้ เนื่องจากมีใบลาที่ใช้ประเภทนี้อยู่",
      });
    }

    await pool.execute("DELETE FROM leave_types WHERE leave_type_id = ?", [id]);

    res.status(200).json({
      message: "ลบประเภทการลาสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

module.exports = router;
