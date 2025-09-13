// ============= controllers/noteController.js =============
const Note = require("../models/Note");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = await User.findById(req.userId).populate("tenantId");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check subscription limits for free plan
    if (user.tenantId.plan === "free") {
      const noteCount = await Note.countDocuments({ tenantId: user.tenantId._id });
      if (noteCount >= 3) {
        return res.status(403).json({ 
          message: "Free plan limit reached. Upgrade to Pro for unlimited notes.",
          code: "PLAN_LIMIT_REACHED"
        });
      }
    }

    const note = new Note({
      title,
      content,
      tenantId: user.tenantId._id,
      createdBy: user._id
    });

    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate("createdBy", "email")
      .populate("tenantId", "name slug");

    res.status(201).json(populatedNote);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getNotes = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notes = await Note.find({ tenantId: user.tenantId })
      .populate("createdBy", "email")
      .populate("tenantId", "name slug")
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const note = await Note.findOne({ 
      _id: req.params.id,
      tenantId: user.tenantId // Ensure tenant isolation
    })
    .populate("createdBy", "email")
    .populate("tenantId", "name slug");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Get note by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const note = await Note.findOne({ 
      _id: req.params.id,
      tenantId: user.tenantId // Ensure tenant isolation
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    
    await note.save();
    
    const updatedNote = await Note.findById(note._id)
      .populate("createdBy", "email")
      .populate("tenantId", "name slug");

    res.json(updatedNote);
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const note = await Note.findOne({ 
      _id: req.params.id,
      tenantId: user.tenantId // Ensure tenant isolation
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await Note.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote
};