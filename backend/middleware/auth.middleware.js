const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {

  const token = req.cookies.token;

  if (!token)
    return res.status(401).json("No token found");

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.token !== token) {
      return res.status(401).json("Session expired. Please login again.");
    }

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json("Invalid token");
  }
};
