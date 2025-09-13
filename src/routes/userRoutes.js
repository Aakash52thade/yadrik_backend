const express = require("express");
const { inviteUser, getTenantUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const {requireAdmin} = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/invite", authMiddleware, requireAdmin, inviteUser);
router.get("/tenant-users", authMiddleware, requireAdmin, getTenantUsers);

module.exports = router;