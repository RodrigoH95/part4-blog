const logger = require("./logger");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};

const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).send({ error: "Malformatted id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({
      error: err.message,
    });
  } else if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
    });
  } else if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
    });
  }

  logger.error(err.message);

  next(err);
};

const requestLogger = (req, res, next) => {
  logger.info(req.method, req.path, req.body);
  next();
};

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    req.token = authorization.substring(7);
  } else {
    req.token = null;
  }
  next();
};

const userExtractor = async (req, res, next) => {
  const token = req.token;
  
  if (req.method !== "GET") {
    const decodedToken = jwt.verify(token, config.SECRET);
    const user = await User.findById(decodedToken.id);
    req.user = user;
  } else {
    req.user = null;
  }
  // if(!decodedToken) {
  //   return res.status(401).json({ error: "Token missing or invalid" });
  // }
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  requestLogger,
  tokenExtractor,
  userExtractor,
};
