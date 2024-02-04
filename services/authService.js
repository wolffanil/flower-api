const User = require("../models/userModel");
const tokenService = require("./tokenService");
const AppError = require("../utils/AppError");
const UserDto = require("../dtos/userDto");

class AuthService {
  async registration({
    name,
    surname,
    patronymic,
    login,
    email,
    password,
    fingerprint,
    next,
  }) {
    const candidate = await User.findOne({ $and: [{ email }, { login }] });

    if (candidate) {
      return next(
        new AppError(
          `Пользователь с почтовым адресом ${email} или логин ${login} уже существует `,
          404
        )
      );
    }

    const user = await User.create({
      name,
      surname,
      patronymic,
      email,
      login,
      password,
    });

    const tokens = tokenService.generateTokens({
      id: user._id,
      role: user.role,
    });

    await tokenService.saveToken(user._id, tokens.refreshToken, fingerprint);

    return { ...tokens, user };
  }

  async login({ login, password, fingerprint, next }) {
    const user = await User.findOne({ login });

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Логин или пароль не верны", 404));
    }

    const tokens = tokenService.generateTokens({
      id: user._id,
      role: user.role,
    });

    await tokenService.saveToken(user._id, tokens.refreshToken, fingerprint);

    return { ...tokens, user };
  }

  async logout(refreshToken) {
    await tokenService.removeToken(refreshToken);
  }

  async refresh({ refreshToken, fingerprint, next }) {
    if (!refreshToken) {
      return next(new AppError("ошибка в токене", 404));
    }

    const userData = await tokenService.validateRefreshToken(refreshToken);

    const tokenFromDb = await tokenService.findToken({
      refreshToken,
      hash: fingerprint.hash,
    });

    if (!userData || !tokenFromDb) {
      return next(
        new AppError("ошибка защиты, пожалуйста авторизируйтесь ещё раз", 404)
      );
    }
    const user = await User.findById(userData.id).lean();

    const tokens = tokenService.generateTokens({
      id: user._id,
      role: user.role,
    });

    await tokenService.removeToken(refreshToken);

    await tokenService.saveToken(user._id, tokens.refreshToken, fingerprint);
    return { ...tokens, user };
  }
}

module.exports = new AuthService();
