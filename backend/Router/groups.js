const express = require("express");
const router = express.Router();
const { pool } = require("../Database/connectMysql");
const { allowOnlyAdmin } = require("../Controllers/Role");
const { VerifyToken } = require("../Middleware/VerifyToken");

// api ดึงรายการแผนก/กลุ่มทั้งหมด
router.get("/groups", VerifyToken, async (req, res) => {
  try {
    const [row] = await pool.execute("SELECT * FROM `groups` ORDER BY group_name");
    return res.status(200).json({
      groups: row,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api เพิ่มแผนก/กลุ่ม (Admin only)
router.post("/groups", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const { group_name } = req.body;

    if (!group_name || group_name.trim() === "") {
      return res.status(400).json({
        message: "กรุณาระบุชื่อกลุ่ม/แผนก",
      });
    }

    const trimmedName = group_name.trim();
    const [row] = await pool.execute(
      "SELECT group_id FROM `groups` WHERE `group_name` = ?",
      [trimmedName]
    );

    if (row.length >= 1) {
      return res.status(409).json({
        message: "ชื่อกลุ่ม/แผนกนี้มีอยู่แล้ว",
      });
    }

    await pool.execute(
      "INSERT INTO `groups` (`group_id`, `group_name`) VALUES (NULL, ?)",
      [trimmedName]
    );

    return res.status(201).json({
      message: "เพิ่มกลุ่ม/แผนกสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api แก้ไขแผนก/กลุ่ม (Admin only)
router.put("/groups/:id", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { group_name } = req.body;

    if (!group_name || group_name.trim() === "") {
      return res.status(400).json({
        message: "กรุณาระบุชื่อกลุ่ม/แผนก",
      });
    }

    const trimmedName = group_name.trim();

    const [existingGroup] = await pool.execute(
      "SELECT group_id FROM `groups` WHERE `group_id` = ?",
      [id]
    );

    if (existingGroup.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลกลุ่ม/แผนก",
      });
    }

    const [duplicateCheck] = await pool.execute(
      "SELECT group_id FROM `groups` WHERE `group_name` = ? AND `group_id` != ?",
      [trimmedName, id]
    );

    if (duplicateCheck.length >= 1) {
      return res.status(409).json({
        message: "ชื่อกลุ่ม/แผนกนี้มีอยู่แล้ว",
      });
    }

    await pool.execute(
      "UPDATE `groups` SET `group_name` = ? WHERE `group_id` = ?",
      [trimmedName, id]
    );

    return res.status(200).json({
      message: "แก้ไขกลุ่ม/แผนกสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api ลบแผนก/กลุ่ม (Admin only)
router.delete("/groups/:id", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const [existingGroup] = await pool.execute(
      "SELECT group_id FROM `groups` WHERE `group_id` = ?",
      [id]
    );

    if (existingGroup.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลกลุ่ม/แผนก",
      });
    }

    await pool.execute("DELETE FROM `groups` WHERE `group_id` = ?", [id]);

    return res.status(200).json({
      message: "ลบกลุ่ม/แผนกสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

module.exports = router;
