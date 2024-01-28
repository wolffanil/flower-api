const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const isAdmin = catchAsync(async (req, res, next) => {

  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("Этот маршрут доступен только админам", 404));
  }

  next();
});

module.exports = isAdmin;
