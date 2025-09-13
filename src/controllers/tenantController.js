// ============= controllers/tenantController.js =============
const Tenant = require("../models/Tenant");
const User = require("../models/User");

const upgradeTenant = async (req, res) => {
  try {
    const { slug } = req.params;
    const user = await User.findById(req.userId).populate("tenantId");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Check if the slug matches user's tenant
    if (user.tenantId.slug !== slug) {
      return res.status(403).json({ message: "Access denied. Cannot upgrade other tenants." });
    }

    // Upgrade tenant
    const tenant = await Tenant.findOneAndUpdate(
      { slug },
      { plan: "pro" },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({
      message: "Tenant upgraded to Pro successfully",
      tenant: {
        id: tenant._id,
        slug: tenant.slug,
        name: tenant.name,
        plan: tenant.plan
      }
    });
  } catch (error) {
    console.error("Upgrade tenant error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  upgradeTenant
};
