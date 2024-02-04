const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const Fingerprint = require("express-fingerprint");
const AppError = require("./utils/AppError");

const globalError = require("./controllers/errorController");
const authRoute = require("./routes/authRoute");
const photoRoute = require("./routes/photoRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const commentRoute = require("./routes/commentRoute");

const app = express();
dotenv.config();

// app.enable('trust proxy');

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.use(
  Fingerprint({
    parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
  })
);

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use("/upload", express.static(path.join(__dirname, "upload")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(cookieParser());

app.get("/favicon.ico", (req, res) => {
  res.status(204);
});

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/photo", photoRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/carts", cartRoute);
app.use("/api/v1/users", commentRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can dont use this ${req.originalUrl}`, 404));
});

app.use(globalError);

module.exports = app;
