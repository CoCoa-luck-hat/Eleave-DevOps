const express = require("express");
const router = express.Router();
const { pool } = require("../Database/connectMysql");
const { allowOnlyManager } = require("../Controllers/Role");
const { VerifyToken } = require("../Middleware/VerifyToken");
const { uploadReport } = require("../Middleware/uploadMiddleware");

// api ดึงรายงานลาทั้งหมด (Manager/Admin)
router.get("/reports", VerifyToken, allowOnlyManager, async (req, res) => {
  try {
    const [row] = await pool.execute(`
      SELECT r.*, u.fullname, u.email, lt.leave_type_name 
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN leave_types lt ON r.leave_type_id = lt.leave_type_id
      ORDER BY r.created_at DESC
    `);
    return res.status(200).json({
      reports: row,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api ดึงรายงานลาตาม ID
router.get("/reports/:id", VerifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, role } = req.user;

    const [row] = await pool.execute(
      `
      SELECT r.*, u.fullname, u.email, lt.leave_type_name 
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.user_id
      LEFT JOIN leave_types lt ON r.leave_type_id = lt.leave_type_id
      WHERE r.report_id = ?
    `,
      [id]
    );

    if (row.length >= 1) {
      const report = row[0];
      // ตรวจสอบสิทธิ์ว่าต้องเป็นเจ้าของ หรือ Manager/Admin
      if (role !== "admin" && role !== "manager" && report.user_id != user_id) {
        return res.status(403).json({
          message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลใบขอนี้",
        });
      }

      return res.status(200).json({
        report: report,
      });
    } else {
      res.status(404).json({
        message: "ไม่พบข้อมูล",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api ดึงรายงานลาของผู้ใช้
router.get("/reports/user/:userId", VerifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { user_id, role } = req.user;

    // ตรวจสอบว่าเป็นเจ้าของหรือเป็น manager/admin
    if (role !== "manager" && role !== "admin" && user_id != userId) {
      return res.status(403).json({
        message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
      });
    }

    const [row] = await pool.execute(
      `
      SELECT r.*, lt.leave_type_name 
      FROM reports r
      LEFT JOIN leave_types lt ON r.leave_type_id = lt.leave_type_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `,
      [userId]
    );

    return res.status(200).json({
      reports: row,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api สร้างรายงานลา
router.post("/reports", VerifyToken, (req, res) => {
  uploadReport(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    try {
      const { user_id } = req.user;
      const {
        leave_type_id,
        leave_at,
        leave_end,
        leave_days,
        reason,
        group_id,
      } = req.body;
      const file_report = req.file ? req.file.filename : null;

      if (!leave_type_id || !leave_at || !leave_end || !leave_days) {
        return res.status(400).json({
          message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        });
      }

      const cleanReason = reason !== undefined && reason !== null ? reason : null;
      const cleanGroupId =
        group_id !== undefined && group_id !== null && group_id !== ""
          ? Number(group_id)
          : null;
      const cleanDays = parseInt(leave_days, 10) || 1;

      await pool.execute(
        `INSERT INTO reports (user_id, leave_type_id, leave_at, leave_end, leave_days, reason, file_report, group_id, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          user_id,
          leave_type_id,
          leave_at,
          leave_end,
          cleanDays,
          cleanReason,
          file_report,
          cleanGroupId,
        ]
      );

      res.status(201).json({
        message: "สร้างใบลาสำเร็จ",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
      });
    }
  });
});

// api แก้ไขรายงานลา (เฉพาะใบลาที่ยังไม่ได้อนุมัติ)
router.put("/reports/:id", VerifyToken, (req, res) => {
  uploadReport(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    try {
      const id = req.params.id;
      const { user_id, role } = req.user;
      const { leave_type_id, leave_at, leave_end, leave_days, reason } =
        req.body;

      // ตรวจสอบว่าใบลานี้เป็นของผู้ใช้หรือไม่
      const [report] = await pool.execute(
        "SELECT * FROM reports WHERE report_id = ?",
        [id]
      );

      if (report.length === 0) {
        return res.status(404).json({
          message: "ไม่พบข้อมูลใบลา",
        });
      }

      if (report[0].user_id !== user_id && role !== "admin") {
        return res.status(403).json({
          message: "คุณไม่มีสิทธิ์แก้ไขใบลานี้",
        });
      }

      if (report[0].status !== "pending") {
        return res.status(400).json({
          message: "ไม่สามารถแก้ไขใบลาที่ได้รับการอนุมัติหรือปฏิเสธแล้ว",
        });
      }

      const cleanLeaveTypeId = leave_type_id || report[0].leave_type_id;
      const cleanLeaveAt = leave_at || report[0].leave_at;
      const cleanLeaveEnd = leave_end || report[0].leave_end;
      const cleanDays = leave_days
        ? parseInt(leave_days, 10) || 1
        : report[0].leave_days;
      const cleanReason =
        reason !== undefined && reason !== null
          ? reason
          : report[0].reason;

      let query =
        "UPDATE reports SET leave_type_id = ?, leave_at = ?, leave_end = ?, leave_days = ?, reason = ?";
      let params = [
        cleanLeaveTypeId,
        cleanLeaveAt,
        cleanLeaveEnd,
        cleanDays,
        cleanReason,
      ];

      if (req.file) {
        query += ", file_report = ?";
        params.push(req.file.filename);
      }

      query += " WHERE report_id = ?";
      params.push(id);

      await pool.execute(query, params);

      res.status(200).json({
        message: "แก้ไขใบลาสำเร็จ",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
      });
    }
  });
});

// api ลบรายงานลา (เฉพาะใบลาที่ยังไม่ได้อนุมัติ)
router.delete("/reports/:id", VerifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, role } = req.user;

    // ตรวจสอบว่าใบลานี้เป็นของผู้ใช้หรือไม่
    const [report] = await pool.execute(
      "SELECT * FROM reports WHERE report_id = ?",
      [id]
    );

    if (report.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลใบลา",
      });
    }

    if (report[0].user_id !== user_id && role !== "admin") {
      return res.status(403).json({
        message: "คุณไม่มีสิทธิ์ลบใบลานี้",
      });
    }

    if (report[0].status !== "pending") {
      return res.status(400).json({
        message: "ไม่สามารถลบใบลาที่ได้รับการอนุมัติหรือปฏิเสธแล้ว",
      });
    }

    await pool.execute("DELETE FROM reports WHERE report_id = ?", [id]);

    res.status(200).json({
      message: "ลบใบลาสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api อนุมัติ/ปฏิเสธใบลา (Manager/Admin only)
router.put(
  "/reports/:id/status",
  VerifyToken,
  allowOnlyManager,
  async (req, res) => {
    try {
      const id = req.params.id;
      const { status, reject_reason } = req.body;

      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({
          message: "สถานะไม่ถูกต้อง",
        });
      }

      if (status === "rejected" && (!reject_reason || reject_reason.trim() === "")) {
        return res.status(400).json({
          message: "กรุณาระบุเหตุผลในการปฏิเสธ",
        });
      }

      const [report] = await pool.execute(
        "SELECT * FROM reports WHERE report_id = ?",
        [id]
      );

      if (report.length === 0) {
        return res.status(404).json({
          message: "ไม่พบข้อมูลใบลา",
        });
      }

      if (report[0].status !== "pending") {
        return res.status(400).json({
          message: "ใบลานี้ได้รับการพิจารณาแล้ว",
        });
      }

      await pool.execute(
        "UPDATE reports SET status = ?, reject_reason = ? WHERE report_id = ?",
        [status, reject_reason ? reject_reason.trim() : null, id]
      );

      res.status(200).json({
        message:
          status === "approved" ? "อนุมัติใบลาสำเร็จ" : "ปฏิเสธใบลาสำเร็จ",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
      });
    }
  }
);

module.exports = router;
