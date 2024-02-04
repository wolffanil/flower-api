const express = require("express");

const {
  uploadPhoto,
  resizeFlowerPhoto,
  deletePhoto,
} = require("../controllers/photoContoller");

const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

// router.use(protect);
// router.use(isAdmin);

// router.post("/uploadPhoto", uploadPhoto, resizeFlowerPhoto);

router.post("/uploadPhoto", uploadPhoto, resizeFlowerPhoto);

router.delete("/deletePhoto/:photoId", deletePhoto);

module.exports = router;
