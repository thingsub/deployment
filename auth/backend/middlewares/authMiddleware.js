// middleware/authMiddleware.js
// 클라이언트가 home같은 인증 필수 페이지에 접근하고자 토큰 검증 요청 보냄.

const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/user");
const GoogleUser = require("../models/googleUser");
const UserMapping = require("../models/userMapping");
const jwt = require("jsonwebtoken");

module.exports = async function authMiddleware(req, res, next) {
  try {
    // 1. 쿠키에서 JWT 토큰 추출
    const token = req.cookies?.token;

    if (!token) {
      console.log("[authMiddleware] 쿠키에 토큰이 없습니다.");
      return res.status(401).json({ message: "인증 토큰이 없습니다." });
    }

    // 2. JWT 토큰 검증 및 디코딩
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[authMiddleware] 디코딩된 토큰 정보:", decoded);

    let user;

    if (decoded.userType === "local") {
      // 로컬 로그인인 경우 User 컬렉션에서 _id로 사용자 조회
      user = await User.findById(decoded.userId);
      if (!user)
        return res
          .status(401)
          .json({ message: "유효하지 않은 로컬 사용자입니다." });
    } else if (decoded.userType === "google") {
      // 구글 로그인인 경우
      console.log("[authMiddleware] decoded.userId:", decoded.userId);
      console.log("[authMiddleware] decoded.userType:", decoded.userType);

      // 1) GoogleUser 컬렉션에서 _id (decoded.userId)로 구글 사용자 조회
      const googleUser = await GoogleUser.findById(decoded.userId);
      if (!googleUser)
        return res
          .status(401)
          .json({ message: "유효하지 않은 구글 사용자입니다." });

      // 2) UserMapping에서 googleUser.googleId (구글 OAuth 계정 ID)로 로컬 계정 매핑 조회
      const mapping = await UserMapping.findOne({
        providerUserId: googleUser.googleId, // 구글 계정 고유 ID (문자열)
        provider: "google",
      });

      console.log("[authMiddleware] UserMapping 조회 결과:", mapping);

      if (mapping) {
        // 매핑된 로컬 계정이 있으면 User 컬렉션에서 조회
        user = await User.findById(mapping.localId);
      }

      // 매핑된 로컬 계정이 없으면 GoogleUser 객체 그대로 사용
      if (!user) {
        user = googleUser;
      }
    } else {
      return res
        .status(401)
        .json({ message: "유효하지 않은 토큰 정보입니다." });
    }

    // 인증 완료된 사용자 정보 요청 객체에 저장 후 다음 미들웨어로
    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (err) {
    console.error("[authMiddleware] 인증 실패:", err);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "세션이 만료되었습니다. 다시 로그인 해주세요." });
    }

    return res
      .status(401)
      .json({ message: "인증에 실패했습니다. 다시 로그인 해주세요." });
  }
};
