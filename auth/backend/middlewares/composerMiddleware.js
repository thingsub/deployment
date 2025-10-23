// auth/backend/middlewares/composerMiddleware.js
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/user"); 
const jwt = require("jsonwebtoken");

/**
 * @description Composer API를 위한 선택적 인증 미들웨어입니다.
 * 인증에 성공하면 req.user에 사용자 정보를 저장하고, 실패해도 요청을 차단하지 않고
 * req.user를 null로 설정한 후 다음 미들웨어로 요청을 전달합니다 (데모 모드 지원).
 */
module.exports = async function composerMiddleware(req, res, next) {
    // 1. 쿠키에서 JWT 토큰 추출
    const token = req.cookies?.token;

    if (!token) {
        // 토큰이 없으면: 미인증 상태로 간주하고 요청을 통과시킴
        // 컨트롤러는 req.user == null임을 확인하여 데모 모드를 제공합니다.
        req.user = null; 
        return next();
    }

    try {
        // 2. JWT 토큰 검증 및 디코딩
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. User 조회 및 세션 유효성 검사 (기존 authMiddleware의 핵심 로직)
        const user = await User.findById(decoded.userId); 
        
        if (!user) {
            console.log(`[composerMiddleware] Invalid User ID in token: ${decoded.userId}`);
//	localStorage.removeItem('BlockComposer');
//	localStorage.removeItem('ScriptComposer');
            req.user = null;
            return next();
        }

        // 현재 User 문서의 currentSessions에서 세션 유효성 확인
        const isValidSession = user.currentSessions?.some(
            (session) =>
              session.sessionId === decoded.sessionId && new Date(session.expiresAt) > new Date()
        );

        if (!isValidSession) {
            console.log("[composerMiddleware] Invalid or expired session. Session ID not found or expired.");
            req.user = null;
            return next();
        }

        // 4. 인증 완료: 사용자 정보 설정 후 다음 미들웨어로
        req.user = user; 
        req.userType = decoded.userType;
        req.sessionId = decoded.sessionId;
        return next();
        
    } catch (err) {
        // JWT 검증 실패 (토큰 만료, 위조 등): 미인증 상태로 간주하고 요청 통과
        console.error(`[composerMiddleware] Authentication failed: ${err.name}`);
        req.user = null; 
        return next();
    }
};
