const allowOnlyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "เฉพาะแอดมินเท่านั้น",
    });
  }
  next();
};

const allowOnlyManager = (req, res, next) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({
      message: "เฉพาะผู้จัดการและแอดมินเท่านั้น",
    });
  }
  next();
};

module.exports = { allowOnlyAdmin, allowOnlyManager };
