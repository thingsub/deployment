// services/accountMapping.js
const User = require("../models/user");
const GoogleUser = require("../models/googleUser");
const UserMapping = require("../models/userMapping");
const { sendPasswordResetEmail } = require("../utils/email");

const bcrypt = require("bcryptjs"); // bcrypt 모듈 임포트

// 3. 구글 계정과 로컬 계정을 매핑 (연결)
exports.accountMapping = async ({ googleId, email, name }) => {
  try {
    console.log("Attempting to find Google user:", googleId);

    // 1. GoogleUser 모델에서 구글 계정 조회
    let googleUser = await GoogleUser.findOne({ googleId });

    if (!googleUser) {
      const existingGoogleUserWithEmail = await GoogleUser.findOne({ email });

      if (existingGoogleUserWithEmail) {
        console.log("같은 이메일의 구글 계정이 이미 존재함 → 기존 것 사용");
        googleUser = existingGoogleUserWithEmail;
      } else {
        googleUser = new GoogleUser({ googleId, email, name });
        await googleUser.save();
        console.log("신규 GoogleUser 생성됨:", googleUser);
      }
    }

    // 2. UserMapping에서 구글 계정에 매핑된 로컬 계정 확인
    let userMapping = await UserMapping.findOne({
      providerUserId: googleId,
      provider: "google",
    });

    if (!userMapping) {
      const existingLocalUser = await User.findOne({ email });

      if (existingLocalUser) {
        // 이 local user가 이미 다른 google 계정에 매핑된 경우 확인
        const existingMapping = await UserMapping.findOne({
          localId: existingLocalUser._id,
          provider: "google",
        });

        if (existingMapping && existingMapping.providerUserId !== googleId) {
          console.log(
            "This local account is already mapped to another Google account."
          );
          return {
            message: "이 로컬 계정은 이미 다른 구글 계정과 연결되어 있습니다.",
            redirectUrl: process.env.FRONTEND_REDIRECT_URI,
          };
        }

        // 새로운 매핑 생성
        userMapping = new UserMapping({
          localId: existingLocalUser._id,
          providerUserId: googleId,
          provider: "google",
        });

        await userMapping.save();
        console.log(
          "Mapped Google account to existing local user:",
          userMapping
        );

        // 4. 매핑된 로컬 계정으로 비밀번호 초기화 이메일 발송
        try {
          await sendPasswordResetEmail(existingLocalUser.email);
          console.log("Password reset email sent successfully.");
        } catch (error) {
          console.error("이메일 전송 실패:", error);
          return {
            message:
              "비밀번호 초기화 이메일 전송에 실패했습니다. 다시 시도해 주세요.",
            redirectUrl: process.env.FRONTEND_REDIRECT_URI,
          };
        }

        return {
          message: "구글 계정과 기존 로컬 계정이 성공적으로 매핑되었습니다.",
          user: googleUser,
          localUser: existingLocalUser,
          redirectUrl: process.env.FRONTEND_REDIRECT_URI, // 이미 매핑된 경우 홈으로 리디렉션
        };
      }

      // 5. 이메일이 존재하지 않으면, 새로운 로컬 계정 생성 (비밀번호 빈 문자열)

      const emailIdPart = email.split("@")[0];
      let newId = emailIdPart;
      let counter = 1;

      // 중복될 때까지 새로운 id 생성
      while (await User.findOne({ id: newId })) {
        newId = `${emailIdPart}_${counter++}`;
      }

      // User 객체 생성
      const localUser = new User({
        id: newId, // 중복 없는 id
        email,
        password: "", // 구글 로그인용
        name,
      });
      await localUser.save();
      console.log("New local user created:", localUser);

      // 6. 새 로컬 계정과 구글 계정을 매핑
      userMapping = new UserMapping({
        localId: localUser._id,
        providerUserId: googleUser.googleId,
        provider: "google",
      });
      await userMapping.save();

      // 7. 비밀번호 변경 이메일 발송
      try {
        await sendPasswordResetEmail(localUser.email);
        console.log("Password reset email sent successfully.");
      } catch (error) {
        console.error("이메일 전송 실패:", error);
      }

      return {
        message: "구글 계정과 로컬 계정이 성공적으로 매핑되었습니다.",
        user: googleUser,
        localUser,
        redirectUrl: process.env.FRONTEND_REDIRECT_URI, // 매핑 완료 페이지로 리디렉션
      };
    }

    // 8. 이미 매핑된 상태라면, 매핑된 로컬 계정 정보 조회
    const localUser = await User.findById(userMapping.localId);

    return {
      message: "구글 계정과 로컬 계정이 이미 매핑되어 있습니다.",
      user: googleUser,
      localUser,
      redirectUrl: process.env.FRONTEND_REDIRECT_URI,
    };
  } catch (error) {
    console.error("구글 계정과 로컬 계정 매핑 중 오류:", error);
    throw new Error("서버 오류");
  }
};

// 라우터용 핸들러 함수 추가
exports.accountMappingHandler = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;
    if (!googleId || !email || !name) {
      return res
        .status(400)
        .json({ success: false, message: "필수 파라미터가 누락되었습니다." });
    }

    const result = await exports.accountMapping({ googleId, email, name });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("accountMappingHandler error:", error);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// 4. 계정 매핑 상태 확인
exports.checkAccountMapping = async (req, res) => {
  try {
    const googleId = req.user.googleId;

    if (googleId) {
      // 구글 계정인 경우: 구글 사용자 ID로 매핑 확인
      const userMapping = await UserMapping.findOne({
        providerUserId: googleId,
        provider: "google",
      });

      if (!userMapping) {
        return res
          .status(200)
          .json({ success: true, mappingStatus: "not_mapped" });
      }

      // 매핑된 로컬 계정 정보 반환
      const localUser = await User.findById(userMapping.localId);
      return res.status(200).json({
        success: true,
        mappingStatus: "mapped",
        localUser: localUser ? { email: localUser.email } : null,
      });
    }

    // 로컬 계정인 경우: 단순히 local_account 반환
    return res.status(200).json({
      success: true,
      mappingStatus: "local_account",
      localUser: req.user,
    });
  } catch (error) {
    console.error("계정 매핑 상태 확인 중 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// 로컬 계정 비밀번호 설정 (provider 변경 없이 비밀번호만 설정)
// exports.setLocalPassword = async (req, res) => {
//   try {
//     const { password } = req.body;
//     const userId = req.user._id; // 이미 로그인된 사용자 정보

//     // 비밀번호 해싱
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // 로컬 사용자 조회
//     const localUser = await User.findById(userId);

//     if (!localUser) {
//       return res
//         .status(404)
//         .json({ success: false, message: "사용자를 찾을 수 없습니다." });
//     }

//     // 비밀번호 설정
//     localUser.password = hashedPassword;
//     await localUser.save();

//     return res.status(200).json({
//       success: true,
//       message: "비밀번호가 성공적으로 설정되었습니다.",
//     });
//   } catch (error) {
//     console.error("비밀번호 설정 중 오류 발생:", error);
//     return res.status(500).json({ success: false, message: "서버 오류" });
//   }
// };

exports.setLocalPassword = async (req, res) => {
  try {
    console.log("🔐 [POST] /set-local-password 호출됨");
    console.log("📦 요청 바디:", req.body);
    console.log("🙍 사용자:", req.user);
    console.log("🔍 사용자 타입:", req.userType);

    const { password } = req.body;
    const user = req.user; // 로그인된 사용자 정보
    const userType = req.userType; // 미들웨어에서 userType을 세팅했다고 가정

    // 비밀번호가 비어있거나 잘못된 타입일 때
    if (!password || typeof password !== "string") {
      console.warn("❌ 비밀번호가 유효하지 않음");
      return res.status(400).json({
        success: false,
        message: "비밀번호가 유효하지 않습니다.",
      });
    }

    let localUser;

    if (userType === "google") {
      // 🔧 mapping은 여기서 정의되어야 함
      const mapping = await UserMapping.findOne({
        provider: "google",
        // providerUserId: user._id, 불가
        localId: user._id,
      });

      console.log("🔗 구글 계정 매핑 결과:", mapping);

      // 구글 로그인인데 매핑된 로컬 계정이 없을 때
      if (!mapping) {
        return res.status(400).json({
          success: false,
          message:
            "구글 계정에 매핑된 로컬 계정이 없습니다. 먼저 로컬 계정을 연동하세요.",
        });
      }

      // localUser = await User.findById(mapping.localId);
      localUser = user;
      if (!localUser) {
        return res.status(404).json({
          success: false,
          message: "매핑된 로컬 계정을 찾을 수 없습니다.",
        });
      }
    } else {
      // 로컬 로그인인 경우, 그냥 현재 user로 처리
      localUser = await User.findById(user._id);
      if (!localUser) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        });
      }
    }

    // 비밀번호 해싱 후 저장
    const hashedPassword = await bcrypt.hash(password, 12);
    localUser.password = hashedPassword;
    await localUser.save();

    console.log("✅ 비밀번호 저장 완료:", localUser.email);

    return res.status(200).json({
      success: true,
      message: "비밀번호가 성공적으로 설정되었습니다.",
    });
  } catch (error) {
    console.error("비밀번호 설정 중 오류 발생:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// 구글 계정 연결 해제
exports.unlinkGoogleAccount = async (userId) => {
  try {
    // localId로 매핑 찾기
    const mapping = await UserMapping.findOne({ localId: userId });
    if (!mapping) {
      return { success: false, message: "연결된 구글 계정이 없습니다." };
    }
    await UserMapping.deleteOne({ _id: mapping._id });
    return { success: true, message: "구글 계정 연결이 해제되었습니다." };
  } catch (error) {
    console.error("구글 계정 연결 해제 실패:", error);
    throw new Error("서버 오류");
  }
};

module.exports = {
  accountMapping: exports.accountMapping,
  accountMappingHandler: exports.accountMappingHandler,
  checkAccountMapping: exports.checkAccountMapping,
  setLocalPassword: exports.setLocalPassword,
  unlinkGoogleAccount: exports.unlinkGoogleAccount,
};
