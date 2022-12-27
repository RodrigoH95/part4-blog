const dummy = (blogs) => {
  blogs; // temporary to avoid eslint error
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (total, blog) => total + blog.likes;
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  return blogs.length === 0 ? {} : blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max);
};

const getBlogsByAuthor = (blogs) => {
  let result = [];
  blogs.forEach((blog) => {
    const index = result.findIndex((b) => b.author === blog.author);
    if (index !== -1) {
      result[index].blogs++;
      result[index].likes += blog.likes;
    } else {
      const newEntry = {
        author: blog.author,
        likes: blog.likes,
        blogs: 1
      };
      result = [...result].concat(newEntry);
    }
  });
  return result;
};

const mostBlogs = (list) => {
  const blogsByAuthor = getBlogsByAuthor(list);
  if(blogsByAuthor.length === 0) return {};
  const { author, blogs } = blogsByAuthor.reduce((max, blog) => blog.blogs > max.blogs ? blog : max);
  return { author, blogs };
};

const mostLikes = (list) => {
  const blogsByAuthor = getBlogsByAuthor(list);
  if(blogsByAuthor.length === 0) return {};
  const { author, likes } = blogsByAuthor.reduce((max, blog) => blog.likes > max.likes ? blog : max);
  return { author, likes };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
