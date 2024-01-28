const { Telegraf } = require("telegraf");
const { getTelegramConfig } = require("../config/telegramConfig");

class TelegramService {
  bot;
  options;

  constructor() {
    this.options = getTelegramConfig();
    this.bot = new Telegraf(this.options.token);
  }

  async sendMessage(msg, options) {
    const chatId = this.options.chatId;
    await this.bot.telegram.sendMessage(chatId, msg, {
      parse_mode: "HTML",
      ...options,
    });
  }

  async sendPhoto(photo, msg) {
    const chatId = this.options.chatId;

    await this.bot.telegram.sendPhoto(
      chatId,
      photo,
      msg
        ? {
            caption: msg,
          }
        : {}
    );
  }
}

module.exports = new TelegramService();
