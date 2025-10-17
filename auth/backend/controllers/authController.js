// controllers/authController.js
require("dotenv").config(); // 환경변수 로드
const { cookieOptions } = require("../utils/cookies");
const User = require("../models/user");
const GoogleUser = require("../models/googleUser");
const UserMapping = require("../models/userMapping");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.root = async (req, res) => res.redirect("/login");

exports.register = async (req, res) => {
  try {
    const { id, email, password, confirmPassword, name } = req.body;

    // name이 누락되었을 경우 처리
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "이름을 입력해주세요." });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
    }

    // 이메일 중복 체크(User, GoogleUser 둘 다 검사)
    const existingUserByEmail = await User.findOne({ email });
    // const existingEmailInGoogleUser = await GoogleUser.findOne({ email });
    // 구글 계정이 이미 존재해도, 로컬 계정 생성은 가능해야 함.

    if (existingUserByEmail) {
      return res
        .status(409)
        .json({ success: false, message: "이미 존재하는 이메일입니다." });
    }

    // id 중복 체크 (로컬 아이디만)
    const existingUserById = await User.findOne({ id });
    if (existingUserById) {
      return res
        .status(409)
        .json({ success: false, message: "이미 존재하는 ID입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 14);

    const newUser = new User({ id, email, password: hashedPassword, name });
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("회원가입 중 오류:", error);
    return res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다(회원가입)." });
  }
};


exports.login = async (req, res) => {
  try {
    const { id, password } = req.body;

    // 로컬 계정만 로그인 가능 (id+password)
    const user = await User.findOne({ id });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "등록되지 않은 사용자입니다." });
    }

    // 구글 연동 계정은 로컬 비밀번호 로그인 불가
    if (!user.password) {
      return res.status(403).json({
        success: false,
        message: "구글 연동 계정은 비밀번호 로그인 불가",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "비밀번호가 잘못되었습니다." });
    }

// ⭐ [세션 로직] 1. 세션 ID 및 만료 시간 준비
    const sessionId = crypto.randomBytes(16).toString("hex"); // 고유 세션 ID 생성
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간 뒤 만료 (cookieOptions.maxAge와 일치)

    // ⭐ [세션 로직] 2. JWT 생성 (sessionId를 페이로드에 포함)
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        userType: "local",
	loginMethod : "local",
        sessionId: sessionId, // DB 세션과 JWT를 연결
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ⭐ [세션 로직] 3. DB 세션 업데이트 (기존 세션 제거, 새 세션 추가)
    // 단일 세션 제한을 위해 기존 세션 배열을 비우고 현재 세션만 유지
    user.currentSessions = []; 
    user.currentSessions.push({ 
      sessionId, 
      expiresAt,
      createdAt: new Date(), 
    });
    await user.save();

    // 쿠키에 토큰 저장
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({ success: true, userId: user.id });
  } catch (error) {
    console.error("로그인 중 오류:", error);
    return res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};


// ID 중복 체크(로컬 id만)
exports.checkIdAvailability = async (req, res) => {
  try {
    const { id } = req.body;
    const existingUser = await User.findOne({ id });

    if (!existingUser) {
      return res.status(200).json({ available: true });
    }

    return res.status(200).json({ available: !existingUser });
  } catch (error) {
    console.error("ID 중복 체크 중 오류:", error);
    return res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};


exports.checkHome = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "인증된 사용자 정보가 없습니다." });
    }

    return res.status(200).json({ success: true, userId: req.user.id });
  } catch (error) {
    console.error("홈 체크 중 오류:", error);
    return res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
};

// 인증된 사용자의 기본 정보 반환 (로컬 or 구글 모두 처리)
exports.getUserInfo = async (req, res) => {
  try {
    const user = req.user;
    let responseData = {
      name: user.name,
      email: user.email,
    };

    if (req.userType === "local") {
      // 로컬 사용자
      responseData.provider = "local";
      responseData.id = user.id;
      responseData.mappingStatus = "local_account";
      responseData.localUser = { email: user.email, id: user.id };
    } else if (req.userType === "google") {
      // 구글 사용자
      responseData.provider = "google";

      // user는 GoogleUser 문서
      // 매핑 상태 조회

      const mapping = await UserMapping.findOne({
        provider: "google",
        providerUserId: user._id,
      });

      if (mapping) {
        const localUser = await User.findById(mapping.localId);
        if (localUser) {
          responseData.mappingStatus = "mapped";
          responseData.localUser = { email: localUser.email, id: localUser.id };
        } else {
          responseData.mappingStatus = "not_mapped";
        }
      } else {
        responseData.mappingStatus = "not_mapped";
      }
    } else {
      // 예외 처리
      responseData.provider = "unknown";
      responseData.mappingStatus = null;
    }

    return res.status(200).json(responseData);
    
      } catch (error) {
    console.error("사용자 정보 가져오기 실패:", error);
    return res.status(500).json({ message: "사용자 정보 로딩 실패" });
  }
};

// 로그아웃 처리
exports.logout = async (req, res) => {
  try {
    // 현재 로그인한 사용자 (req.user는 미들웨어에서 설정됨)
    const user = req.user;

 // req.user, req.sessionId는 authMiddleware를 통해 전달됨.
    if (user && user.currentSessions && req.sessionId) {
        // 현재 세션 ID와 일치하는 세션을 필터링하여 제거
        user.currentSessions = user.currentSessions.filter(
            session => session.sessionId !== req.sessionId
        );
        // 비동기로 DB 저장 시도 (오류가 발생해도 로그아웃 자체는 진행)
        user.save().catch(err => console.error("세션 DB 삭제 실패:", err));
    }

    // ⭐ [쿠키 로직] 쿠키에서 토큰 삭제 (res.clearCookie 사용)
    res.clearCookie("token", cookieOptions);

    return res
      .status(200)
      .json({ success: true, message: "로그아웃 되었습니다." });
  } catch (error) {
    console.error("로그아웃 중 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};
