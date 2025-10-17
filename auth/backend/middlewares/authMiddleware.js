const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/user");
// GoogleUser는 세션 검사에 필요 없으므로 제거합니다.
// const GoogleUser = require("../models/googleUser"); 
// UserMapping도 세션 검사에 필요 없으므로 제거합니다.
// const UserMapping = require("../models/userMapping"); 
const jwt = require("jsonwebtoken");

module.exports = async function authMiddleware(req, res, next) {
  try {
    // 1. 쿠키에서 JWT 토큰 추출
    const token = req.cookies?.token;

    if (!token) {
      console.log("[authMiddleware] No token in cookies.");
      return res.status(401).json({ message: "인증 토큰이 없습니다." });
    }

    // 2. JWT 토큰 검증 및 디코딩
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("[authMiddleware] Decoded token info:", decoded); // 디버깅 시 필요

    // **핵심 변경:** userType에 관계없이 로컬 User 모델에서 세션 유효성 검사

    // 토큰의 userId는 이제 항상 로컬 User의 _id를 가리켜야 합니다.
    const user = await User.findById(decoded.userId); 
    
    if (!user) {
        console.log(`[authMiddleware] Invalid User ID in token: ${decoded.userId}`);
        return res
            .status(401)
            .json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    // 3. 세션 유효성 검사 (로컬/구글 통일)
    // 현재 User 문서의 currentSessions에서 토큰의 sessionId와 일치하고 만료되지 않은 세션을 찾습니다.
    const isValidSession = user.currentSessions?.some(
        (session) =>
          session.sessionId === decoded.sessionId && new Date(session.expiresAt) > new Date()
    );

    if (!isValidSession) {
        console.log("[authMiddleware] Invalid or expired session. Session ID not found or expired.");
        // JWT는 유효하지만, DB에서 해당 세션 ID가 삭제된 경우 (다른 곳에서 로그인됨)
        return res
          .status(401)
          .json({ message: "유효하지 않거나 만료된 세션입니다. (중복 로그인)" });
    }

    // 4. 인증 완료된 사용자 정보 요청 객체에 저장 후 다음 미들웨어로
    req.user = user; // 항상 로컬 User 문서
    req.userType = decoded.userType;
    req.sessionId = decoded.sessionId;
    next();
  } catch (err) {
    console.error("[authMiddleware] Authentication failed:", err);

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
