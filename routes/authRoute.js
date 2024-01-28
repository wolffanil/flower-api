const express = require("express");

const authController = require("../controllers/authController");

const loginLimiter = require("../middlewares/loginLimiterMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

module.exports = router;
