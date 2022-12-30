const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const Blog = require("../models/blog");
const User = require("../models/user");

const api = supertest(app);

let token = null;

beforeAll(async () => {
  await User.deleteMany({});

  await api
    .post("/api/users")
    .send({
      "username": "root",
      "name": "Superuser",
      "password": "secret"
    });
  
  const login = await api
    .post("/api/login")
    .send({
      "username": "root",
      "password": "secret"
    });

  token = login.body.token;
});

beforeEach(async () => {
  await Blog.deleteMany({});

  for (const blog of helper.initialBlogs) {
    await api
      .post("/api/blogs")
      .set("Authorization", "bearer " + token)
      .send(blog)
      .expect(201);
  }
});

describe("Retrieving blogs from database", () => {
  test("Blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 100000);

  test("All blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  }, 100000);

  test("Blog titled 'First Post' is within returned blogs", async () => {
    const response = await api.get("/api/blogs");
    const contents = response.body.map((b) => b.title);

    expect(contents).toContain("First post");
  }, 100000);

  test("Can retrieve a single blog by id", async () => {
    const startingBlogs = await helper.blogsInDB();

    const blog = startingBlogs[0];
    const resultBlog = await api
      .get(`/api/blogs/${blog.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const proccesedBlog = JSON.parse(JSON.stringify(blog));

    expect(resultBlog.body).toEqual(proccesedBlog);
  });
});

describe("Viewing specific blog", () => {
  test("Succeeds with a valid id", async () => {
    const startingBlogs = await helper.blogsInDB();
    const blogToView = startingBlogs[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const processedBlog = JSON.parse(JSON.stringify(blogToView));

    expect(resultBlog.body).toEqual(processedBlog);
  });

  test("Fails with status code 404 if note does not exist", async () => {
    const validNonexistingID = await helper.nonExistingID();
    await api.get(`/api/blogs/${validNonexistingID}`).expect(404);
  });

  test("Fails with status code 400 if id is invalid", async () => {
    const invalidID = "5a3d5da59070081a82a3445";
    await api.get(`/api/blogs/${invalidID}`).expect(400);
  });
});

describe("Adding blogs to database", () => {
  test("A valid blog can be added", async () => {
    const newBlog = {
      title: "Third post",
      author: "David",
      url: "www.davidblog.com",
      likes: 7
    };

    await api
      .post("/api/blogs")
      .set("Authorization", "bearer " + token)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const finalBlogs = await helper.blogsInDB();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length + 1);

    const contents = finalBlogs.map((b) => b.title);
    expect(contents).toContain("Third post");
  }, 100000);

  test("Blog with no content is not added", async () => {
    const newBlog = {
      title: "",
      author: "",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", "bearer " + token)
      .send(newBlog)
      .expect(400);

    const finalBlogs = await helper.blogsInDB();
    expect(finalBlogs).toHaveLength(helper.initialBlogs.length);
  }, 100000);

  test("If likes property is missing, blog is created with 0 likes", async () => {
    const newBlog = {
      title: "Third post",
      author: "David",
      url: "www.davidblog.com"
    };

    const createdBlog = await api
      .post("/api/blogs")
      .set("Authorization", "bearer " + token)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(createdBlog.body.likes).toBe(0);
  });

  test("Fails with status code 401 if no token is provided", async () => {
    const response = await api
      .post("/api/blogs")
      .send({ title: "test", author: "test", url: "test"})
      .expect(401)
      .expect("Content-Type", /application\/json/);

    expect(response.body.error).toContain("Invalid token");
  });
});

describe("Deleting blog from database", () => {
  test("with valid id gives status 204", async () => {
    const startingBlogs = await helper.blogsInDB();
    const blogToDelete = startingBlogs[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", "bearer " + token)
      .expect(204);

    const endingBlogs = await helper.blogsInDB();
    expect(endingBlogs).toHaveLength(startingBlogs.length - 1);

    const contents = endingBlogs.map((b) => b.title);
    expect(contents).not.toContain(blogToDelete.title);
  });

  test("with invalid id gives status 400", async () => {
    await api
      .delete("/api/blogs/1du890ud10j29")
      .set("Authorization", "bearer " + token)
      .expect(400);
  });
});

describe("Updating blog", () => {
  test("with valid id and properties returns valid blog with status 200", async () => {
    const blogs = await helper.blogsInDB();
    const newBlog = { ...blogs[0], title: "test title" };

    const updatedBlog = await api
      .put(`/api/blogs/${blogs[0].id}`)
      .set("Authorization", "bearer " + token)
      .send(newBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(updatedBlog.body.title).toEqual("test title");
  });

  test("with invalid id gives status 400", async () => {
    const blogs = await helper.blogsInDB();
    const newBlog = { ...blogs[0], title: "test title" };

    await api
      .put("/api/blogs/23j89f32h89g78")
      .set("Authorization", "bearer " + token)
      .send(newBlog)
      .expect(400);
  });

  test("with invalid data gives status 400", async () => {
    const blogs = await helper.blogsInDB();
    const newBlog = { 
      title: "",
      author: "",
      url: "",
      likes: 0
    };

    await api
      .put(`/api/blogs/${blogs[0].id}`)
      .set("Authorization", "bearer " + token)
      .send(newBlog)
      .expect(400);
  });
});

describe("Blog properties", () => {
  test("Blog id property named correctly", async () => {
    const blogs = await helper.blogsInDB();
    const blog = blogs[0];
    expect(blog.id).toBeDefined();
  });
});

afterAll(() => mongoose.connection.close());
