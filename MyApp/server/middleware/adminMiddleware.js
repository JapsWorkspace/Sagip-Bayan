const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session || req.session.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = {
  requireLogin,
  requireAdmin
};