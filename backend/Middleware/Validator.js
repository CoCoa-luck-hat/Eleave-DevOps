const { checkSchema } = require('express-validator');

const RegisterValidator = checkSchema({
  fullname: {
    in: ["body"],
    trim: true,
    isLength: { options: { min: 2 } },
    errorMessage: 'กรุณากรอกชื่อ-นามสกุล',
  },
  email: {
    in: ["body"],
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'อีเมลรูปแบบไม่ถูกต้อง',
  },
  password: {
    in: ["body"],
    isLength: { options: { min: 4 } },
    errorMessage: 'กรุณากรอกรหัสผ่าน 4 ตัวขึ้นไป',
  },
});

const LoginValidator = checkSchema({
  email: {
    in: ["body"],
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'อีเมลรูปแบบไม่ถูกต้อง',
  },
  password: {
    in: ["body"],
    isLength: { options: { min: 4 } },
    errorMessage: 'กรุณากรอกรหัสผ่าน 4 ตัวขึ้นไป',
  },
});

module.exports = { LoginValidator, RegisterValidator };
