const express = require("express");

const protect = require("../middlewares/authMiddleware");
const {
  createOrEditComment,
  getAllComments,
  deleteComment,
} = require("../controllers/commentController");
const router = express.Router();

router.use(protect);

router.get("/comments", getAllComments);
router.patch("/create-comment", createOrEditComment);
router.patch("/edit-comment", createOrEditComment);
router.delete("/delete-comment", deleteComment);

module.exports = router;
