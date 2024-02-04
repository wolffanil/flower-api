const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { v4: uuidv4 } = require("uuid");

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
});

exports.uploadPhoto = upload.single("image");

exports.resizeFlowerPhoto = catchAsync(async (req, res) => {
  if (!req.file)
    return res.status(400).json({
      status: "error",
      message: "The file not exist",
    });

  req.file.filename = `flower-${uuidv4()}.jpeg`;

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`upload/flowerPhoto/${req.file.filename}`);

  res.status(200).json({
    status: "seccess",
    imageUrl: `${process.env.SERVER_URL}/upload/flowerPhoto/${req.file.filename}`,
  });
});

exports.deletePhoto = catchAsync(async (req, res) => {
  const photoId = req.params.photoId;

  const filePath = path.join(__dirname, "../upload/flowerPhoto", photoId);

  await fs.unlink(filePath);
  res.status(200).json({
    status: "seccess",
  });
});
