const express = require("express");
require("express-async-errors");
const cors = require("cors");
const blogRouter = require("./controllers/blog");
const userRouter = require("./controllers/user");
const loginRouter = require("./controllers/login");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");
const { unknownEndpoint, errorHandler, requestLogger, tokenExtractor, userExtractor } = require("./utils/middleware");

const app = express();

// To supress deprecation warning in console
mongoose.set("strictQuery", true);

logger.info("Connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("Error connecting to MongoDB", err.message));

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(tokenExtractor);

app.use("/api/login", loginRouter);
app.use("/api/blogs", userExtractor, blogRouter);
app.use("/api/users", userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
