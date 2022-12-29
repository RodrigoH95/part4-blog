const express = require("express");
require("express-async-errors");
const cors = require("cors");
const blogRouter = require("./controllers/blog");
const userRouter = require("./controllers/user");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");

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
app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);

module.exports = app;
