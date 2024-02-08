const catchAsync = require("../utils/catchAsync");
const authService = require("../services/authService");

class AuthController {
  register = catchAsync(async (req, res, next) => {
    const { fingerprint } = req;

    const userData = await authService.registration({
      ...req.body,
      next,
      fingerprint,
    });

    return this.createSendToken(userData, 201, res, req);
  });

  login = catchAsync(async (req, res, next) => {
    const { fingerprint } = req;
    const userData = await authService.login({
      ...req.body,
      next,
      fingerprint,
    });

    return this.createSendToken(userData, 200, res, req);
  });

  logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;

    await authService.logout(refreshToken);

    res.clearCookie("refreshToken");

    return res.status(200).json({
      status: "success",
    });
  });

  refresh = catchAsync(async (req, res, next) => {
    const { fingerprint } = req;

    const { refreshToken } = req.cookies;

    const userData = await authService.refresh({
      refreshToken,
      fingerprint,
      next,
    });

    return this.createSendToken(userData, 200, res, req);
  });

  createSendToken = (userData, statusCode, res, req) => {
    res.cookie("refreshToken", userData.refreshToken, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIERS_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: "none",
    });

    userData.user.password = undefined;
    userData.refreshToken = undefined;

    res.status(statusCode).json({ userData });
  };
}

module.exports = new AuthController();
