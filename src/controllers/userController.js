const bcrypt = require("bcryptjs");
const User = require("../models/User");


//create function inviteUser 
const inviteUser = async (req, res) => {
    try {
        //get the email and role from req.body
        const {email, role = number} = req.body;

        console.log("User invitation attempt by admin:", req.userId);
        console.log("Inviting email:", email, "with role:", role);

        //validate input
        if(!email){
            return res.status(400).json({message: "Email is required"});
        }

        if(!["admin", "member"].includes(role)) {
            return res.status(400).json({message: "Role must be either 'admin' or 'member'"});
        }

        const adminUser = await User.findById(req.userId).populate("tenantId");

        if(!adminUser){
            return res.status(404).json({message: "Admin user not found"})
        }

        console.log("Admin tenant:", adminUser.tenantId.name);
        
        const existingUser = await User.findOne({email});

        if(existingUser){
            console.log("User already exists:", email);
            return res.status(400).json({message: "User already exists"})
        }

        const tempPassword = "password";
        console.log("Using standard password:", tempPassword);

        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = new User({
            email,
            passwordHash: hashedPassword,
            role,
            tenantId: adminUser.tenantId._id
        });

         await newUser.save();
         console.log("New user created with ID:", newUser._id);

         const populatedUser = await User.findById(newUser._id)
         .populate("tenantId", "name slug plan");

          console.log("User invitation successful") 
        
          res.status(201).json({
          message: "User invited successfully",
          user: {
            id: populatedUser._id,
            email: populatedUser.email,
            role: populatedUser.role,
            tenant: {
            id: populatedUser.tenantId._id,
            slug: populatedUser.tenantId.slug,
            name: populatedUser.tenantId.name,
            plan: populatedUser.tenantId.plan
            }
        },
        temporaryPassword: tempPassword  // In real app, send this via email
      });
    } catch (error) {
        console.error("Invite user error:", error);
        res.status(500).json({ message: "Server error" });
    }
}


const getTenantUsers = async (req, res) => {
  try {
    const adminUser = await User.findById(req.userId).populate("tenantId");
    
    if (!adminUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all users in the same tenant
    const tenantUsers = await User.find({ tenantId: adminUser.tenantId._id })
      .select("-passwordHash") // Don't return password hashes
      .populate("tenantId", "name slug plan")
      .sort({ createdAt: -1 });

    res.json({
      tenant: {
        id: adminUser.tenantId._id,
        slug: adminUser.tenantId.slug,
        name: adminUser.tenantId.name,
        plan: adminUser.tenantId.plan
      },
      users: tenantUsers.map(user => ({
        id: user._id,
        email: user.email,
        role: user.role
      }))
    });
  } catch (error) {
    console.error("Get tenant users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
    inviteUser,
    getTenantUsers
}