// ============= routes/tenantRoutes.js =============
const express = require("express");
const { upgradeTenant } = require("../controllers/tenantController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/:slug/upgrade", authMiddleware, requireAdmin, upgradeTenant);

module.exports = router;