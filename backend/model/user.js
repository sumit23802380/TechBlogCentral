const mongoose = require("mongoose");
const Blog = require("./blog");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "Blogger",
  },
  blogs: [],
});

const user = mongoose.model("user", userSchema);
module.exports = user;
