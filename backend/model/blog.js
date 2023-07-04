const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authorEmail: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  tags: [],
  isArchived: {
    type: Boolean,
    default: false,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
});

const blog = mongoose.model("blog", blogSchema);
module.exports = blog;
