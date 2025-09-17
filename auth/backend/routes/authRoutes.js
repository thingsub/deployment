// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const googleAuthController = require("../controllers/googleAuthController");
const accountMapping = require("../services/accountMapping");

// [POST] 로그인
router.post("/login", authController.login);

// [POST] 회원가입
router.post("/register", authController.register);

// [POST] ID 중복 확인
router.post("/check-id", authController.checkIdAvailability);

// [GET] 구글 로그인 시작
router.get("/google", googleAuthController.googleAuth);

// [GET] 구글 콜백
router.get("/google/callback", googleAuthController.googleCallback);

// [GET] 인증된 사용자만 접근 가능 (쿠키에서 JWT 확인)
router.get("/check-home", authMiddleware, authController.checkHome);

router.get("/me", authMiddleware, authController.getUserInfo);

// [GET] 로그아웃 (쿠키 삭제)
router.get("/logout", authMiddleware, authController.logout);

// [GET] 구글 계정과 로컬 계정 매핑 상태 확인
router.get(
  "/check-account-mapping",
  authMiddleware,
  accountMapping.checkAccountMapping
);

// [POST] 로컬 계정 비밀번호 설정
router.post(
  "/set-local-password",
  authMiddleware,
  accountMapping.setLocalPassword
);

// [POST] 구글 계정과 로컬 계정 매핑
router.post(
  "/account-mapping",
  authMiddleware,
  accountMapping.accountMappingHandler
);

module.exports = router;
