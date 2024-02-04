const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Слишком много запрос пожалуйста повторите попытки через 60 секунд",

  //   handler: (req, res, next, options) => {
  //     logEvents(
  //       `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
  //       "errLog.log"
  //     );
  //     res.status(options.statusCode).send(options.message);
  //   },
  //   standardHeaders: true,
  //   legacyHeaders: false,
});

module.exports = loginLimiter;
