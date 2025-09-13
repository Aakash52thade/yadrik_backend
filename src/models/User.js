const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin", "member"], default: "member" },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }
});

module.exports = mongoose.model("User", userSchema);
