const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  name: String,
  plan: { type: String, enum: ["free", "pro"], default: "free" }
});

module.exports = mongoose.model("Tenant", tenantSchema);
