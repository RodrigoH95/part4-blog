const bcrypt = require("bcrypt");
const userRouter = require("express").Router();
const User = require("../models/user");

userRouter.get("/", async (req, res) => {
  const users = await User
    .find({})
    .populate("blogs", { title: 1, author: 1, likes: 1 });

  res.json(users);
});

userRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  const existingUser = await User.findOne({ username });

  if (!(username && password)) {
    return res.status(400).json({
      error: "username and password are required"
    });
  }

  if(username.length < 3 || password.length < 3) {
    return res.status(400).json({
      error: "Invalid username or password (must be at least 3 characters long)"
    });
  }

  if (existingUser) {
    return res.status(400).json({
      error: "Username must be unique"
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    name,
    passwordHash
  });

  const savedUser = await user.save();
  
  res.status(201).json(savedUser);
});

module.exports = userRouter;