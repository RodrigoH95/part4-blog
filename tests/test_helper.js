const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "First post",
    author: "Rodrigo",
    url: "www.mysiteurl.com",
    likes: 10
  },
  {
    title: "Second post",
    author: "Monica",
    url: "www.personalblog.com",
    likes: 20
  }
];

const nonExistingID = async () => {
  const blog = new Blog({
    title: "title",
    author: "author",
    url: "url",
    likes: 0
  });

  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDB = async () => {
  const blogs = await Blog.find({});
  return blogs.map(b => b.toJSON());
};

const usersInDB = async () => {
  const users = await User.find({});
  return users.map(u => u.toJSON());
};

module.exports = { initialBlogs, nonExistingID, blogsInDB, usersInDB };