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

      // 3. 세션 유효성 검사 (로컬 사용자)
      const isValidSession = user.currentSessions?.some(
        (session) =>
          session.sessionId === decoded.sessionId && new Date(session.expiresAt) > new Date()
      );

      if (!isValidSession) {
        console.log("[authMiddleware] 유효하지 않은 세션입니다. 중복 로그인?");
        return res
          .status(401)
          .json({ message: "유효하지 않거나 만료된 세션입니다." });
      }
    } 



else if (decoded.userType === "google") {
      // 구글 로그인인 경우
      console.log("[authMiddleware] decoded.userId:", decoded.userId);
      console.log("[authMiddleware] decoded.userType:", decoded.userType);


      // 1) GoogleUser 컬렉션에서 _id (decoded.userId)로 구글 사용자 조회
      // NOTE: 세션 정보는 GoogleUser에 저장되어 있으므로, 이 객체를 세션 검사에 사용해야 합니다.
      const googleUser = await GoogleUser.findById(decoded.userId);
      if (!googleUser)
        return res
          .status(401)
          .json({ message: "유효하지 않은 구글 사용자입니다." });

      // 2) ⭐ 세션 유효성 검사: GoogleUser 객체에 대해 바로 수행
      const isValidSession = googleUser.currentSessions?.some(
        (session) =>
          session.sessionId === decoded.sessionId && new Date(session.expiresAt) > new Date()
      );

      if (!isValidSession) {
        console.log("[authMiddleware] 유효하지 않은 세션입니다. 중복 로그인?");
        return res
          .status(401)
          .json({ message: "유효하지 않거나 만료된 세션입니다." });
      }

      // 3) UserMapping에서 googleUser.googleId로 매핑된 로컬 계정 조회 (req.user 설정 목적)
      const mapping = await UserMapping.findOne({
        providerUserId: googleUser.googleId, // 구글 계정 고유 ID (문자열)
        provider: "google",
      });


      console.log("[authMiddleware] UserMapping 조회 결과:", mapping);

      if (mapping) {
        // 매핑된 로컬 계정이 있으면 User 컬렉션에서 조회하여 user에 할당
        user = await User.findById(mapping.localId);
      }

      // 매핑된 로컬 계정이 없거나 조회 실패 시 GoogleUser 객체를 user에 할당
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
    req.sessionId = decoded.sessionId;
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
