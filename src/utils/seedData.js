const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const connectDB = require("../config/db");

// Load environment variables FIRST
dotenv.config();

// Debug: Check if env vars are loaded
console.log("Environment variables check:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("PORT:", process.env.PORT ? "✅ Loaded" : "❌ Missing");
console.log("---");

const seedData = async () => {
  try {
    console.log("🌱 Starting seed process...");
    
    await connectDB();
    console.log("📦 Connected to database");
    
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Tenant.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create tenants
    console.log("🏢 Creating tenants...");
    const acmeTenant = await Tenant.create({
      slug: "acme",
      name: "Acme Corporation",
      plan: "free"
    });

    const globexTenant = await Tenant.create({
      slug: "globex",
      name: "Globex Corporation", 
      plan: "free"
    });
    console.log("✅ Tenants created");

    // Hash password
    console.log("🔐 Hashing passwords...");
    const hashedPassword = await bcrypt.hash("password", 10);
    console.log("✅ Passwords hashed");

    // Create users
    console.log("👥 Creating users...");
    const users = await User.create([
      {
        email: "admin@acme.test",
        passwordHash: hashedPassword,
        role: "admin",
        tenantId: acmeTenant._id
      },
      {
        email: "user@acme.test",
        passwordHash: hashedPassword,
        role: "member",
        tenantId: acmeTenant._id
      },
      {
        email: "admin@globex.test",
        passwordHash: hashedPassword,
        role: "admin",
        tenantId: globexTenant._id
      },
      {
        email: "user@globex.test",
        passwordHash: hashedPassword,
        role: "member",
        tenantId: globexTenant._id
      }
    ]);
    
    console.log("✅ Users created");
    console.log("\n📋 Seed Summary:");
    console.log("- Tenants created: 2");
    console.log("- Users created: 4");
    console.log("- Default password: 'password'");
    console.log("\n🎉 Seed data created successfully!");
    
    // Close connection
    await mongoose.connection.close();
    console.log("📡 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;