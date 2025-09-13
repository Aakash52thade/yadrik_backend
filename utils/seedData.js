const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const connectDB = require("../config/db");

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Tenant.deleteMany({});

    // Create tenants
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

    // Hash password
    const hashedPassword = await bcrypt.hash("password", 10);

    // Create users
    await User.create([
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

    console.log("Seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
