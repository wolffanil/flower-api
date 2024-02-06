const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

class CommentController {
  getAllComments = catchAsync(async (req, res, next) => {
    const comments = await User.find({
      comment: { $exists: true },
    })
      .select("_id name comment")
      .lean();

    res.status(200).json({ comments });
  });

  createOrEditComment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const comment = req.body.text;

    await User.findByIdAndUpdate(userId, { comment });

    res.status(200).json({ status: "ok" });
  });

  deleteComment = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.comment = undefined;
    user.save();

    res.status(200).json({ status: "ok" });
  });
}

module.exports = new CommentController();
