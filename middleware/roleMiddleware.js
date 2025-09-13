const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    next();
  } catch (error) {
    console.error("Role middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  requireAdmin
};