// ============= controllers/authController.js =============
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with tenant info
    const user = await User.findOne({ email }).populate("tenantId");
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenant: {
          id: user.tenantId._id,
          slug: user.tenantId.slug,
          name: user.tenantId.name,
          plan: user.tenantId.plan
        }
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("tenantId");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      tenant: {
        id: user.tenantId._id,
        slug: user.tenantId.slug,
        name: user.tenantId.name,
        plan: user.tenantId.plan
      }
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  getMe
};