const mongoose = require("mongoose");
const blogTagSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true,
  },
  blogId: {
    type: [String],
    required: true,
  },
});

const blogTag = new mongoose.model("blogTag", blogTagSchema);
module.exports = blogTag;
