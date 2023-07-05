const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  // console.log(token);
  if (!token) {
    return res.status(401).json("No token , authorization denied");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json("Invalid token");
  }
};
