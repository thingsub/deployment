// backend/models/userMapping.js
const mongoose = require("mongoose");

const userMappingSchema = new mongoose.Schema(
  {
    localId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      // 👉 현재는 한 로컬 계정이 하나의 provider 계정만 연결 가능 (1:1 보장)
    },
    provider: {
      type: String,
      required: true,
      enum: ["google"], // 지금은 구글만, 나중에 github, kakao 추가 가능
      default: "google",
    },
    providerUserId: {
      type: String,
      ref: "GoogleUser", // 현재는 구글 전용
      required: true,
      unique: true,
      // 👉 현재는 한 구글 계정이 하나의 로컬 계정만 연결 가능 (1:1 보장)
    },
  },
  { timestamps: true }
);

// ✅ 확장성을 위한 복합 인덱스도 미리 걸어두면 안전
userMappingSchema.index(
  { localId: 1, provider: 1, providerUserId: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserMapping", userMappingSchema);

/*
운영 팁

지금은 1:1이라 단순하게 구현 가능
확장 시 마이그레이션 필요 없음 → 그냥 unique: true만 빼주면 끝
*/
