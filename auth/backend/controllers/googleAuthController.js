const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const GoogleUser = require("../models/googleUser");
const UserMapping = require("../models/userMapping");
const crypto = require("crypto");
const { cookieOptions } = require("../utils/cookies");
const { sendPasswordResetEmail } = require("../utils/email");

const { accountMapping } = require("../services/accountMapping");
//const { accountMapping } = require("../services/accountMappingService");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 1. 구글 인증 URL 생성
exports.googleAuth = async (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex"); // CSRF 방어용 state 생성
    res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax" });

    const redirectUri = client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      state, // 여기에 state 포함시켜야 CSRF 방어가 완성됨
    });

    // 프론트로 URL을 JSON으로 보내지 않고 바로 리디렉션
    return res.redirect(redirectUri);
  } catch (error) {
    console.error("Google Auth Redirect Error:", error);
    res
      .status(500)
      .json({ success: false, message: "구글 인증 리디렉션 실패" });
  }
};

// 2. 구글 콜백 처리
exports.googleCallback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const savedState = req.cookies.oauth_state;

  if (!state || state !== savedState) {
    return res
      .status(403)
      .json({ success: false, message: "잘못된 요청입니다 (state 불일치)." });
  }

  // state 검증 후 쿠키 삭제
  res.clearCookie("oauth_state", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  try {
    // 2-1. 인증 코드로 토큰 발급
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // 2-2. 사용자 정보 추출
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || "Anonymous"; // 만약 구글에서 name이 없다면 "Anonymous"로 설정

    // 디버깅용 로그 추가
    console.log("Google ID:", googleId);
    console.log("Email:", email);
    console.log("Name:", name);

    // 2-3, 2-4. 구글 계정과 로컬 계정 매핑 처리
    const mappingResult = await accountMapping({ googleId, email, name });


// **핵심**: 세션 관리를 위한 로그인 주체 설정

    const loginAccount = mappingResult.user; // 항상 GoogleUser 문서
    const userType = "google"; // Google 로그인이므로 userType은 항상 'google'입니다.

    if (!loginAccount) {
      return res
        .status(500)
        .json({ success: false, message: "로그인 처리 실패 (사용자 객체 로딩 실패)" });
    }

    // =============================================================
    // ⭐ [세션 로직] JWT/DB 기반 단일 세션 강제 구현
    // =============================================================

// ⭐ 1. 세션 ID 및 만료 시간 준비
    const sessionId = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간 뒤 만료

    // ⭐ 2. JWT 생성 (sessionId를 페이로드에 포함하여 미들웨어에서 DB 세션과 비교)
   
    // ✅ 디버깅용 로그: JWT에 담길 최종 페이로드 확인
    console.log("[Google Auth] JWT payload 생성 정보:", {
      userId: loginAccount._id.toString(),
      userType: userType,
      sessionId: sessionId
    });

    const token = jwt.sign(
      {
        userId: loginAccount._id.toString(),
        userType: userType,
        sessionId: sessionId, // DB 세션과 JWT를 연결하는 고유 ID
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    // ⭐ 3. DB 세션 업데이트 (기존 세션 제거 후 새 세션만 저장 = 단일 세션 강제)
    // Mongoose findByIdAndUpdate를 사용하여 세션 업데이트의 원자성을 높이고 확실히 저장
    await GoogleUser.findByIdAndUpdate(
      loginAccount._id,
      {
        currentSessions: [
          {
            sessionId,
            expiresAt,
            createdAt: new Date(),
          },
        ],
      },
      { new: true }
    );


    // ⭐ 4. 쿠키에 토큰 저장
    // 🚨 강제 제거: 이전의 잘못된 토큰이 남아있을 경우를 대비하여 먼저 제거합니다.
    res.clearCookie("token", cookieOptions);
    // 새 토큰으로 덮어씁니다.
    res.cookie("token", token, cookieOptions);


    // ✅ 최종 리디렉션 URL 확인
    const redirectUrl = mappingResult.redirectUrl || process.env.FRONTEND_REDIRECT_URI;
    console.log(`[Google Auth] 최종 리디렉션 URL: ${redirectUrl}`);

        // 여기서 JSON 응답 하지 말고 무조건 redirect
        return res.redirect(redirectUrl);


  } catch (error) {
    console.error("Google Callback Error:", error);
    res.status(500).json({ success: false, message: "Google 로그인 실패" });
  }
};
