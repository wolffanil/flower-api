const catchAsync = require("../utils/catchAsync");
const Product = require("../models/productModel");
const AppError = require("../utils/AppError");

class LikeController {
  createLike = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const productId = req.body.productId;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError("Товар не был найден", 404));
    }

    const existingLike = product.likes.find((like) =>
      like.userId.equals(userId)
    );

    if (existingLike) {
      return next(new AppError("Лайк уже поставлен", 400));
    }

    product.likes.push({ userId });

    await product.save();

    return res.status(201).json({ status: "ok" });
  });

  deleteLike = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError("Товар не был найден", 404));
    }

    product.likes = product.likes.filter((like) => !like.userId.equals(userId));

    await product.save();

    return res.status(204).json({ status: "ok" });
  });
}

module.exports = new LikeController();
