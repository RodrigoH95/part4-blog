const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  res.json(blogs);
});

blogRouter.post("/", async (req, res) => {
  const body = req.body;
  const user = req.user;

  if (!(body && body.title && body.author && body.url)) {
    return res.status(400).end();
  }

  if (!body.likes) body.likes = 0;

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
    const userId = req.user.id;
    const blogToUpdate = await Blog.findById(req.params.id);
    

    if (!body || !body.title || !body.author || !body.url) {
      return res.status(400).end();
    }

    if(!(userId && blogToUpdate.user.toString() === userId.toString() )) {
      return res.status(401).json({
        error: "Unauthorized blog update request"
      });
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
  } catch (err) {
    res.status(400);
    next(err);
  }
});

blogRouter.delete("/:id", async (req, res, next) => {
  try {

    const userId = req.user.id;
    const blog = await Blog.findById(req.params.id);


    
    if(!(userId && (blog.user.toString() === userId.toString()))) {
      return res.status(401).json({
        error: "Not authorized to delete this blog"
      });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400);
    next(err);
  }
});

module.exports = blogRouter;
