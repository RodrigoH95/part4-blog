const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    return authorization.substring(7);
  }

  return null;
};

blogRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  res.json(blogs);
});

blogRouter.post("/", async (req, res) => {
  const body = req.body;
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, config.SECRET);

  console.log("Decoded Token", decodedToken);

  if(!decodedToken.id) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }

  if (!body || !body.title || !body.author || !body.url) {
    return res.status(400).end();
  }

  if (!body.likes) body.likes = 0;

  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});

blogRouter.get("/:id", async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      res.status(200).json(blog);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    res.status(400);
    next(err);
  }
});

blogRouter.put("/:id", async (req, res, next) => {
  try {
    const body = req.body;

    if (!body || !body.title || !body.author || !body.url) {
      return res.status(400).end();
    }

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
      new: true,
    });
    res.json(updatedBlog);
    console.log("Updated blog", updatedBlog);
  } catch (err) {
    res.status(400);
    next(err);
  }
});

blogRouter.delete("/:id", async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400);
    next(err);
  }
});

module.exports = blogRouter;
