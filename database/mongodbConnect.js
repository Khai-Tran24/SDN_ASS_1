const mongoose = require("mongoose");

const connectMongoDB = mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log(error));

module.exports = connectMongoDB;
