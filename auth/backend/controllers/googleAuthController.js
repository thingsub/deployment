// controllers/googleAuthController.js
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const GoogleUser = require("../models/googleUser");
const UserMapping = require("../models/userMapping");
const crypto = require("crypto");
const { cookieOptions } = require("../utils/cookies");
const { sendPasswordResetEmail } = require("../utils/email");

const { accountMapping } = require("../services/accountMapping");

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

    // 2-3, 2-4. 구글 계정과 로컬 계정 매핑 처리 (기존 조회 및 생성 대신 accountMapping 호출)
    const mappingResult = await accountMapping({ googleId, email, name });

    // 디버깅: 매핑 결과 출력
    console.log("Mapping Result:", mappingResult);

    // 4. JWT 발급 기준: localUser 우선
    const userForToken = mappingResult.localUser || mappingResult.user;
    if (!userForToken) {
      return res
        .status(500)
        .json({ success: false, message: "로그인 처리 실패 (사용자 없음)" });
    }

    // 4. JWT 발급 기준: 실제 로그인 계정 기준
    const isGoogleLogin = !!mappingResult.user.googleId;

    // 로그인 계정 기준 선택
    const loginAccount = isGoogleLogin
      ? mappingResult.user
      : mappingResult.localUser;

    // JWT 발급 (userType은 로그인 계정 기준)
    const token = jwt.sign(
      {
        userId: loginAccount._id.toString(),
        userType: isGoogleLogin ? "google" : "local",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

	const mappingResult = await accountMapping({ googleId, email, name });
	// JWT 발급 후 쿠키 설정
	res.cookie("token", token, cookieOptions);
	// 여기서 JSON 응답 하지 말고 무조건 redirect
	return res.redirect(mappingResult.redirectUrl || process.env.FRONTEND_REDIRECT_URI);


  } catch (error) {
    console.error("Google Callback Error:", error);
    res.status(500).json({ success: false, message: "Google 로그인 실패" });
  }
};
