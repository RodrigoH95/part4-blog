const bcrypt = require("bcrypt");
const User = require("../models/user");
const supertest = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const helper = require("./test_helper");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("secret", 10);
  const user = new User({ username: "root", passwordHash });

  await user.save();
});

describe("With one user in db", () => {
  test("Creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "test123",
      name: "User",
      password: "password"
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("Creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "secret"
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Username must be unique");

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("Creation fails if no username or password is provided", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "",
      password: "",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
    expect(response.body.error).toContain("username and password are required");
  });

  test("Creation fails if username or password length is invalid", async() => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "aa",
      password: "password",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    
    newUser.username = "validLength";
    newUser.password = "**";

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
    expect(response.body.error).toContain("Invalid username or password (must be at least 3 characters long)");
  });
});

afterAll(() => mongoose.connection.close());
