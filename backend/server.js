const express = require("express");
require("dotenv").config();
require("./config/dbConnect");
const app = express();

const User = require("./routes/user");
// const Blog = require("./routes/blog");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Tech Blog Central Server Running");
});

app.use("/user", User);
// app.use("/blogs", Blog);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
