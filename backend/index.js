const express = require("express");
const app = express();
const { readdirSync } = require("fs");
const path = require("path");
require("dotenv").config();
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Serve static files - รองรับทั้ง local และ production
const uploadsPath = process.env.NODE_ENV === 'production'
  ? '/app/uploads'
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// โหลด Routers ทั้งหมดในโฟลเดอร์ Router
const routerPath = path.join(__dirname, "Router");
readdirSync(routerPath).forEach((file) => {
  if (file.endsWith(".js")) {
    app.use("/api", require(path.join(routerPath, file)));
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
