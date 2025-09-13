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
    
    console.log("🔍 Login attempt for:", email);
    console.log("📝 Request body:", { email, password: password ? "[PROVIDED]" : "[MISSING]" });

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user with tenant info
    const user = await User.findOne({ email }).populate("tenantId");
    console.log("👤 User found:", user ? "✅ Yes" : "❌ No");
    
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("🏢 User tenant:", user.tenantId?.name);
    console.log("👔 User role:", user.role);

    // Check password
    console.log("🔐 Comparing passwords...");
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log("🔐 Password valid:", isPasswordValid ? "✅ Yes" : "❌ No");
    
    if (!isPasswordValid) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    console.log("🎫 Generating token...");
    const token = generateToken(user._id);
    console.log("✅ Token generated successfully");

    const response = {
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
    };

    console.log("🎉 Login successful for:", email);
    res.json(response);
  } catch (error) {
    console.error("💥 Login error:", error);
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