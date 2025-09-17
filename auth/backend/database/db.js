// database/db.js

const mongoose = require("mongoose");
require("dotenv").config(); // 환경변수 로드

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

module.exports = { connect };
