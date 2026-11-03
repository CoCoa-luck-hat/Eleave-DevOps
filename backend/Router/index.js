const express = require("express");
const router = express.Router();
const { pool } = require("../Database/connectMysql");
const {
  LoginValidator,
  RegisterValidator,
} = require("../Middleware/Validator");
const { VerifyToken } = require("../Middleware/VerifyToken");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// api สมัครสมาชิก
router.post("/register", RegisterValidator, async (req, res) => {
  const Validator_error = validationResult(req);
  if (!Validator_error.isEmpty()) {
    return res.status(400).json({
      message: Validator_error.array()[0].msg,
      validator: Validator_error.array(),
    });
  }
  try {
    const { fullname, email, password } = req.body;
    const [row] = await pool.execute("SELECT * FROM `users` WHERE email = ?", [
      email,
    ]);
    if (row.length >= 1) {
      return res.status(409).json({
        message: "อีเมลนี้ถูกใช้ไปแล้ว",
      });
    } else {
      await pool.execute(
        "INSERT INTO `users` (`user_id`, `fullname`, `profile`, `email`, `password`, `role`, `created_at`) VALUES (NULL, ?, NULL, ?, ?, 'employee', CURRENT_TIMESTAMP);",
        [fullname, email, password]
      );
      res.status(201).json({
        message: "สมัครสมาชิกสำเร็จ",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api เข้าสู่ระบบ
router.post("/login", LoginValidator, async (req, res) => {
  const Validator_error = validationResult(req);
  if (!Validator_error.isEmpty()) {
    return res.status(400).json({
      message: Validator_error.array()[0].msg,
      validator: Validator_error.array(),
    });
  }
  try {
    const { email, password } = req.body;
    const [row] = await pool.execute(
      "SELECT * FROM `users` WHERE email = ? AND password = ?",
      [email, password]
    );
    if (row.length === 0) {
      return res.status(404).json({
        message: "อีเมลหรือรหัสผ่านผิด",
      });
    } else {
      const user = row[0];
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.TOKEN_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "เข้าสู่ระบบสำเร็จ",
        user: user,
        token: token,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api ดึงข้อมูลของตัวเอง
router.get("/profile", VerifyToken, async (req, res) => {
  try {
    const { email } = req.user;
    const [row] = await pool.execute("SELECT * FROM `users` WHERE email = ?", [
      email,
    ]);
    if (row.length >= 1) {
      return res.status(200).json({
        user: row[0],
        token: req.token,
      });
    } else {
      res.status(404).json({
        message: "กรุณาเข้าสู่ระบบใหม่",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดบางอย่างจากเซิร์ฟเวอร์",
    });
  }
});

// api แก้ไขข้อมูลส่วนตัว
router.put("/profile", VerifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { fullname, email, password } = req.body;

    const updates = [];
    const params = [];

    if (fullname !== undefined && fullname !== null && fullname.trim() !== "") {
      updates.push("`fullname` = ?");
      params.push(fullname.trim());
    }

    if (email !== undefined && email !== null && email.trim() !== "") {
      const trimmedEmail = email.trim();
      const [existing] = await pool.execute(
        "SELECT user_id FROM `users` WHERE email = ? AND user_id != ?",
        [trimmedEmail, user_id]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          message: "อีเมลนี้ถูกใช้ไปแล้ว",
        });
      }
      updates.push("`email` = ?");
      params.push(trimmedEmail);
    }

    if (password !== undefined && password !== null && password !== "") {
      updates.push("`password` = ?");
      params.push(password);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: "ไม่มีข้อมูลที่ต้องแก้ไข",
      });
    }

    params.push(user_id);
    await pool.execute(
      `UPDATE \`users\` SET ${updates.join(", ")} WHERE \`user_id\` = ?`,
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

module.exports = router;
