// backend/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true, required: true }, // 로그인 ID (유니크)
    password: { type: String }, // 로컬 로그인용 비밀번호 (필수)   // required: true  잠시 삭제
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true, default: "Anonymous" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
