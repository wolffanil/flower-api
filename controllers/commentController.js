const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

class CommentController {
  getAllComments = catchAsync(async (req, res, next) => {
    const comments = await User.find().select("name comment").lean();

    res.status(200).json({ comments });
  });

  createOrEditComment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const comment = req.body.text;

    await User.findByIdAndUpdate({ user: userId }, { comment });

    return true;
  });

  deleteComment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    await User.findByIdAndUpdate({ user: userId }, { comment: undefined });
  });
}

module.exports = new CommentController();
