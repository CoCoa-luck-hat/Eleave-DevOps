const express = require("express");
const router = express.Router();
const { pool } = require("../Database/connectMysql");
const { allowOnlyAdmin } = require("../Controllers/Role");
const { VerifyToken } = require("../Middleware/VerifyToken");
const { uploadProfile } = require("../Middleware/uploadMiddleware");

// api ดึงรายชื่อผู้ใช้ทั้งหมด (Admin only)
router.get("/users", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const [row] = await pool.execute(`
      SELECT u.user_id, u.fullname, u.profile, u.email, u.role, u.group_id, u.created_at, g.group_name
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.group_id
      ORDER BY u.created_at DESC
    `);
    return res.status(200).json({
      users: row,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api เพิ่มผู้ใช้ใหม่ (Admin only)
router.post("/users", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const { fullname, email, password, role, group_id } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ-นามสกุล, อีเมล, รหัสผ่าน)",
      });
    }

    const trimmedEmail = email.trim();
    const [existing] = await pool.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [trimmedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "อีเมลนี้ถูกใช้ไปแล้ว",
      });
    }

    const validRoles = ["employee", "manager", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "employee";
    const userGroupId = group_id !== undefined && group_id !== "" && group_id !== null ? Number(group_id) : null;

    await pool.execute(
      "INSERT INTO users (fullname, email, password, role, group_id) VALUES (?, ?, ?, ?, ?)",
      [fullname.trim(), trimmedEmail, password, userRole, userGroupId]
    );

    res.status(201).json({
      message: "เพิ่มผู้ใช้ใหม่สำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api ดึงข้อมูลผู้ใช้ตาม ID
router.get("/users/:id", VerifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, role } = req.user;

    // ตรวจสอบว่าเป็นเจ้าของหรือเป็น admin
    if (role !== "admin" && user_id != id) {
      return res.status(403).json({
        message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
      });
    }

    const [row] = await pool.execute(
      `
      SELECT u.user_id, u.fullname, u.profile, u.email, u.role, u.group_id, u.created_at, g.group_name
      FROM users u
      LEFT JOIN \`groups\` g ON u.group_id = g.group_id
      WHERE u.user_id = ?
    `,
      [id]
    );

    if (row.length >= 1) {
      return res.status(200).json({
        user: row[0],
      });
    } else {
      res.status(404).json({
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api แก้ไขข้อมูลผู้ใช้
router.put("/users/:id", VerifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, role } = req.user;
    const { fullname, email, password, group_id } = req.body;

    // ตรวจสอบว่าเป็นเจ้าของหรือเป็น admin
    if (role !== "admin" && user_id != id) {
      return res.status(403).json({
        message: "คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้",
      });
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
    const [existingUser] = await pool.execute(
      "SELECT user_id FROM users WHERE user_id = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    const updates = [];
    const params = [];

    if (fullname !== undefined && fullname !== null && fullname.trim() !== "") {
      updates.push("fullname = ?");
      params.push(fullname.trim());
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    if (email !== undefined && email !== null && email.trim() !== "") {
      const trimmedEmail = email.trim();
      const [existing] = await pool.execute(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
        [trimmedEmail, id]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          message: "อีเมลนี้ถูกใช้ไปแล้ว",
        });
      }
      updates.push("email = ?");
      params.push(trimmedEmail);
    }

    // อัปเดตรหัสผ่านหากมีการส่งมา
    if (password !== undefined && password !== null && password !== "") {
      updates.push("password = ?");
      params.push(password);
    }

    // เฉพาะ Admin เท่านั้นที่สามารถเปลี่ยนแผนกได้
    if (group_id !== undefined && role === "admin") {
      const parsedGroupId = group_id === "" || group_id === null ? null : Number(group_id);
      updates.push("group_id = ?");
      params.push(parsedGroupId);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: "ไม่มีข้อมูลที่ต้องแก้ไข",
      });
    }

    params.push(id);
    await pool.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`,
      params
    );

    res.status(200).json({
      message: "แก้ไขข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api ลบผู้ใช้ (Admin only)
router.delete("/users/:id", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id } = req.user;

    // ป้องกันไม่ให้ลบตัวเอง
    if (user_id == id) {
      return res.status(400).json({
        message: "ไม่สามารถลบบัญชีของตัวเองได้",
      });
    }

    const [user] = await pool.execute("SELECT user_id FROM users WHERE user_id = ?", [
      id,
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    await pool.execute("DELETE FROM users WHERE user_id = ?", [id]);

    res.status(200).json({
      message: "ลบผู้ใช้สำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api เปลี่ยนบทบาทผู้ใช้ (Admin only)
router.put("/users/:id/role", VerifyToken, allowOnlyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id } = req.user;
    const { role } = req.body;

    if (!role || !["employee", "manager", "admin"].includes(role)) {
      return res.status(400).json({
        message: "บทบาทไม่ถูกต้อง",
      });
    }

    // ป้องกันไม่ให้เปลี่ยนบทบาทตัวเอง
    if (user_id == id) {
      return res.status(400).json({
        message: "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้",
      });
    }

    const [user] = await pool.execute("SELECT user_id FROM users WHERE user_id = ?", [
      id,
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    await pool.execute("UPDATE users SET role = ? WHERE user_id = ?", [
      role,
      id,
    ]);

    res.status(200).json({
      message: "เปลี่ยนบทบาทสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api อัพโหลดรูปโปรไฟล์
router.post("/users/:id/upload-profile", VerifyToken, (req, res) => {
  uploadProfile(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    try {
      const id = req.params.id;
      const { user_id, role } = req.user;

      // ตรวจสอบว่าเป็นเจ้าของหรือเป็น admin
      if (role !== "admin" && user_id != id) {
        return res.status(403).json({
          message: "คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "กรุณาเลือกไฟล์",
        });
      }

      await pool.execute("UPDATE users SET profile = ? WHERE user_id = ?", [
        req.file.filename,
        id,
      ]);

      res.status(200).json({
        message: "อัพโหลดรูปโปรไฟล์สำเร็จ",
        filename: req.file.filename,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
      });
    }
  });
});

module.exports = router;
