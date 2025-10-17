// backend/utils/sessionManager.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // ⭐ [수정] 내장 모듈 crypto를 사용하여 고유 ID 생성 (UUID 오류 해결)
const mongoose = require("mongoose"); 

require("dotenv").config(); 

/**
 * 새로운 세션을 생성하고, User 모델에 저장하며, JWT 토큰을 발급합니다.
 * 이 함수는 User 모델의 모든 기존 세션을 제거하고 새로운 세션 하나만 유지하여 
 * 단일 활성 세션을 강제합니다.
 *
 * @param {object} user - 세션을 저장할 Mongoose User 문서 객체
 * @param {string} userType - 로그인 타입 (e.g., 'local' 또는 'google')
 * @returns {Promise<{token: string, userType: string}>} - JWT 토큰 및 사용자 타입
 */
async function createAndSetNewSession(user, userType) {
  // DB 연결 전에 로드된 모델을 가져옵니다.
  const User = mongoose.model("User");
  
  // 1. 세션 ID 및 만료 시간 준비
  // crypto를 사용하여 고유 세션 ID 생성
  const sessionId = crypto.randomBytes(16).toString("hex"); 
  const expiresInHours = 1; 
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000); 

  // ⭐ [디버깅 로그 1] 새로운 세션 생성 시점 기록
  console.log(`[SessionManager] 새로운 세션 생성 요청: UserID=${user._id.toString()}, Type=${userType}`);

  // 2. JWT 생성
  const token = jwt.sign(
    {
      userId: user._id.toString(), 
      userType: userType, 
      sessionId: sessionId, 
    },
    process.env.JWT_SECRET,
    { expiresIn: `${expiresInHours}h` }
  );

  // ⭐ [디버깅 로그 2] 발급된 JWT 페이로드 정보 기록
  // 로그 문자열이 잘려서 나타나지 않도록 콘솔 로그를 수정했습니다.
  console.log(`[SessionManager] JWT 발급: { userId: ${user._id.toString()}, userType: ${userType}, sessionId: ${sessionId.substring(0, 8)}... }`);


  // 3. DB 세션 업데이트 (단일 세션 강제)
  // 기존 세션 배열을 비우고 현재 세션만 유지합니다.
  user.currentSessions = [];
  user.currentSessions.push({
    sessionId,
    expiresAt,
    createdAt: new Date(),
  });
  
  // 변경사항 저장
  await user.save();

  // ⭐ [디버깅 로그 3] DB 세션 업데이트 완료 확인
  console.log(`[SessionManager] DB 세션 업데이트 완료: User._id=${user._id.toString()}, 세션 카운트: ${user.currentSessions.length}`);

  return { token, userType };
}

module.exports = {
  createAndSetNewSession,
};
