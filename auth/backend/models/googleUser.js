// backend/models/googleUser.js
const mongoose = require("mongoose");

const googleUserSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, required: true }, // 구글 고유 ID
    email: { type: String, required: true, index: true }, // unique: true를 껴버리면 매핑 이슈로 구글 로그인까지 막혀버림
    name: { type: String, required: true, default: "Anonymous" },
    currentSessions: [
      {
        sessionId: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleUser", googleUserSchema);

/* GPT 개쌉꿀팁
⚠️ 개선하면 좋은 포인트 : GoogleUser.email의 unique 제거 필요

지금은 GoogleUser에 unique: true라서,
로컬 회원가입에서 먼저 등록된 이메일이 있으면 구글 로그인 자체가 막힘

의도는 “동일 이메일 중복 방지”지만, 실제 플로우에서는 구글 로그인 후 로컬 매핑도 있어야 하므로
→ GoogleUser.email은 index: true만 주고 unique는 빼는 게 맞습니다.
*/
