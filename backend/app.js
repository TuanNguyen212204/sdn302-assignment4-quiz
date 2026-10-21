require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5174")
  .split(",")
  .map(function (origin) {
    return origin.trim();
  });

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      const error = new Error("This frontend origin is not allowed");
      error.status = 403;
      callback(error);
    },
  }),
);
app.use(
  logger("dev", {
    skip: function () {
      return process.env.NODE_ENV === "test";
    },
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(function (req, res, next) {
  if (!req.body) {
    req.body = {};
  }
  next();
});

app.get("/health", function (req, res) {
  const connected = mongoose.connection.readyState === 1;
  res
    .status(connected ? 200 : 503)
    .json({ status: connected ? "ok" : "database unavailable" });
});
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/questions", require("./routes/questions"));
app.use("/quizzes", require("./routes/quizzes"));

app.use(function (req, res) {
  res.status(404).json({ message: "Route not found" });
});
app.use(function (error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map(function (item) {
      return item.message;
    });
    res.status(400).json({ message: errors.join("; ") });
    return;
  }
  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: "Invalid " + error.path });
    return;
  }
  if (error.code === 11000) {
    res.status(409).json({ message: "Username already exists" });
    return;
  }
  const status = error.status || 500;
  if (status === 500) {
    console.error(error);
  }
  const message = status === 500 ? "Internal server error" : error.message;
  res.status(status).json({ message: message });
});

module.exports = app;
