const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin, name: user.name },
    process.env.SECRET_TOKEN,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin, username: user.username },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
