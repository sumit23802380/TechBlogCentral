const mongoose = require("mongoose");
const Blog = require("./blog");
const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
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
