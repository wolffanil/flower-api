const express = require("express");

const protect = require("../middlewares/authMiddleware");
const {
  createOrEditComment,
  getAllComments,
  deleteComment,
} = require("../controllers/commentController");
const router = express.Router();

router.get("/comments", getAllComments);
router.patch("/create-comment", protect, createOrEditComment);
router.patch("/edit-comment", protect, createOrEditComment);
router.delete("/delete-comment", protect, deleteComment);

module.exports = router;
