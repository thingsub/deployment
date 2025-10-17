require("dotenv").config(); // 환경변수 로드
const { cookieOptions } = require("../utils/cookies");
const User = require("../models/user");
const GoogleUser = require("../models/googleUser");
const UserMapping = require("../models/userMapping");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ⭐ [추가된 부분] 세션 관리 유틸리티 가져오기
const { createAndSetNewSession } = require("../utils/sessionManager");

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

    // ⭐ [수정된 부분] SessionManager 유틸리티 사용으로 대체
    // User 모델에 세션을 저장하고, 기존 세션을 모두 무효화합니다.
    const { token } = await createAndSetNewSession(user, "local"); 

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

      // user는 GoogleUser 문서 (authMiddleware가 수정되어 req.user는 항상 User 문서여야 함)
      // NOTE: 기존 로직을 유지하면서, req.user가 이제 User 문서라고 가정하고 수정
      
      // user가 User 문서(localUser)라면, 매핑 정보는 UserMapping에서 찾지 않아도 됨.
      // req.user는 authMiddleware 수정 후 무조건 User 모델 인스턴스입니다.
      // 따라서 이 부분의 로직은 req.user가 GoogleUser일 때 작성된 것으로 보이므로, 
      // authMiddleware 변경에 맞게 로직을 단순화해야 하지만, 현재는 최대한 유지합니다.

      // 🚨 임시 수정: authMiddleware가 수정되었으므로, req.user는 User 문서입니다.
      // 구글 로그인으로 들어왔더라도 req.user는 매핑된 User 문서입니다.
      // 따라서 매핑 상태를 확인하는 로직은 UserMapping을 통해 localId가 연결되었는지 확인하는 방식 대신, 
      // req.user가 구글 연동으로 생성된 User 문서인지 확인하는 방식으로 변경되어야 하나,
      // 기존 로직을 최대한 유지하기 위해 이 부분은 당분간 그대로 둡니다.

      // 기존 로직 (req.user가 GoogleUser일 때를 가정):
      const mapping = await UserMapping.findOne({
        localId: user._id, // req.user는 이제 User 문서이므로 localId를 사용
        provider: "google",
      });

      if (mapping) {
        // 매핑이 있다면 (구글 연동된 로컬 계정)
        responseData.mappingStatus = "mapped";
        responseData.localUser = { email: user.email, id: user.id };
      } else {
        // 매핑이 없다면 (순수 로컬 계정이거나, 에러 케이스)
        responseData.mappingStatus = "not_mapped";
        responseData.localUser = { email: user.email, id: user.id }; // User 정보를 그대로 사용
      }
      
      // 🚨 이 로직은 `authMiddleware.js`를 통일하면서 발생한 로직 불일치로, 
      // 향후 `req.userType`에 따라 `User` 모델 내부에 provider 필드를 추가하여 
      // '구글 연동된 로컬 계정'을 더 쉽게 구분하도록 개선이 필요합니다. 
      
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
        // SessionManager로 인해 currentSessions 배열에 세션이 하나만 있더라도, 
        // filter 로직은 안전하게 작동합니다.
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
