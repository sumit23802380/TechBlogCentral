const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../model/user");
const Blog = require("../model/blog");
const { ObjectId } = require("mongodb");
const BlogTag = require("../model/blogTag");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saveSingleTag = async (tag, bId) => {
  try {
    let t = await BlogTag.findOne({
      tagName: tag,
    });

    if (!t) {
      const newTag = new BlogTag({
        tagName: tag,
        blogId: bId,
      });
      newTag
        .save()
        .then((savedTag) => {
          console.log(savedTag);
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      t.blogId.push(bId);
      t.save().then().catch();
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Error while saving the tag");
  }
};

/**
 * @route POST /user/register
 * @description Register a new User
 */
router.post(
  "/register",
  [
    check("name", "Name is Required").not().isEmpty(),
    check("email", "Please include a valid email address").isEmail(),
    check("password", "Please enter a password of min Length 8").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json(errors);
    }
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({
        email: req.body.email,
      });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      user = new User({
        name: name,
        email: email,
        password: hashed,
      });
      await user.save();
      res.status(200).json(user);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/**
 *  @route POST /user/login
 *  @description Login the user
 */
router.post(
  "/login",
  [
    check("email", "Please inclue a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors });
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (!user) {
        return res.status(400).json("User does not exists");
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json("Invalid Login");
      }
      const payload = {
        email: email,
        name: user.name,
      };
      jwt.sign(
        payload,
        process.env.JWT_PRIVATE_KEY,
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ success: true, token: token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

/**
 * @route POST   /user/blogs
 * @description Create a Blog
 */
router.post("/blogs", (req, res) => {
  const newBlog = new Blog({
    title: req.body.title,
    authorEmail: req.body.authorEmail,
    publishedAt: new Date(req.body.publishedAt),
    body: req.body.body,
    tags: req.body.tags,
    likeCount: req.body.likeCount,
    isArchived: req.body.isArchived,
  });
  newBlog
    .save()
    .then((savedBlog) => {
      const tags = savedBlog.tags;
      const bId = savedBlog._id;
      tags.forEach((tag) => {
        try {
          saveSingleTag(tag, bId).then().catch();
        } catch (err) {
          console.log(err.message);
        }
      });
      res.status(200).json(savedBlog);
    })
    .catch((err) => {
      console.log("Error", err);
      res.status(400).send("Error Occured during saving a new Blog");
    });
});

/**
 * @route GET /user/blogs
 * @description get all the blogs created by current user those are not archived
 */
router.get("/blogs", (req, res) => {
  Blog.find({
    // authorEmail: req.query.userEmail,
    isArchived: false,
  })
    .then((blogs) => {
      res.json(blogs);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

/**
 * @route GET /user/blogs/archived
 * @description get all archived blogs
 */
router.get("/blogs/archived", (req, res) => {
  Blog.find({
    authorEmail: req.query.userEmail,
    isArchived: true,
  })
    .then((blogs) => {
      res.status(200).json(blogs);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

/**
 * @route PUT /user/blogs/archive/:blogid
 * @description archive the particular blog created by user
 */
router.put("/blogs/archive/:blogid", (req, res) => {
  Blog.findOne({
    authorEmail: req.query.userEmail,
    isArchived: false,
    _id: new ObjectId(req.params.blogid),
  })
    .then((blog) => {
      console.log(blog);
      blog.isArchived = true;
      blog
        .save()
        .then((curr) => {
          res.json(blog);
        })
        .catch((err) => {
          console.log("Error while archiving the blog");
          res.json(err);
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

/**
 *  @route PUT /usr/blogs/unarchive/:blogid
 *  @description unarchive the particular blog created by user which are archived
 */
router.put("/blogs/unarchive/:blogid", (req, res) => {
  Blog.findOne({
    authorEmail: req.query.userEmail,
    isArchived: true,
    _id: new ObjectId(req.params.blogid),
  })
    .then((blog) => {
      console.log(blog);
      blog.isArchived = false;
      blog
        .save()
        .then((curr) => {
          res.json(blog);
        })
        .catch((err) => {
          console.log("Error while Unarchiving and saving the blog");
          res.json(err);
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

module.exports = router;

/**
 * Register a user
 * Login user
 * Current user
 */
