const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  const body = request.body;

  if(!body || !body.title || !body.author || !body.url) {
    return response.status(400).end();
  }

  if(!body.likes) body.likes = 0;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  });

  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

module.exports = blogRouter;
