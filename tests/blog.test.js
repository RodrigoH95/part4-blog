const listHelper = require("../utils/list_helper");

test("Dummy function returns one", () => {
  expect(listHelper.dummy([])).toBe(1);
});

const listWithOneBlog = [
  {
    id: "1",
    author: "Adam Smith",
    likes: 5,
  }
];
const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
];

describe("Blog Likes", () => {

  test("Empty list returns 0", () => {
    expect(listHelper.totalLikes([])).toBe(0);
  });

  test("List with one blog return likes of that blog", () => {
    expect(listHelper.totalLikes(listWithOneBlog)).toBe(5);
  });

  test("Multiple blogs returns sum of likes", () => {
    expect(listHelper.totalLikes(blogs)).toBe(36);
  });
});

describe("Favorite blog", () => {
  test("Empty list returns empty obj", () => {
    expect(listHelper.favoriteBlog([])).toEqual({});
  });

  test("List with one blog returns that blog", () => {
    expect(listHelper.favoriteBlog(listWithOneBlog)).toEqual(listWithOneBlog[0]);
  });

  test("Multiple blogs return most liked blog", () => {
    const mostLiked = {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    };
    expect(listHelper.favoriteBlog(blogs)).toEqual(mostLiked);
  });
});

describe("Most blogs by author", () => {
  test("Empty list returns empty object", () => {
    expect(listHelper.mostBlogs([])).toEqual({});
  });

  test("List with one blog return author with one blog", () => {
    const expected = {
      author: "Adam Smith",
      blogs: 1
    };

    expect(listHelper.mostBlogs(listWithOneBlog)).toEqual(expected);
  });

  test("List with many blogs returns author with most blogs", () => {
    const expected = {
      author: "Robert C. Martin",
      blogs: 3
    };

    expect(listHelper.mostBlogs(blogs)).toEqual(expected);
  });
});

describe("Most liked blogs", () => {
  test("Empty array returns empty obj", () => {
    expect(listHelper.mostLikes([])).toEqual({});
  });

  test("Array with one blog returns likes of that blog", () => {
    const expected = {
      author: "Adam Smith",
      likes: 5
    };
    expect(listHelper.mostLikes(listWithOneBlog)).toEqual(expected);
  });

  test("Multiple blogs return most liked blog", () => {
    const expected = {
      author: "Edsger W. Dijkstra",
      likes: 17
    };
    expect(listHelper.mostLikes(blogs)).toEqual(expected);
  });
});
