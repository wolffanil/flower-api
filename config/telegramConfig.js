require("dotenv").config();

exports.getTelegramConfig = () => ({
  chatId: process.env.CHAT_ID,
  token: process.env.TOKEN_TELEGRAM,
});
