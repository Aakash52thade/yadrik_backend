const express = require("express");
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote
} = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All note routes require authentication
router.use(authMiddleware);

router.post("/notes", createNote);
router.get("/notes", getNotes);
router.get("/notes/:id", getNoteById);
router.put("/notes/:id", updateNote);
router.delete("/notes/:id", deleteNote);

module.exports = router;