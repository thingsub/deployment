// utils/email.js

const nodemailer = require("nodemailer");

async function sendPasswordResetEmail(userEmail) {
  // SMTP 연결 설정
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // 환경변수로 설정된 이메일
      pass: process.env.EMAIL_PASS, // 환경변수로 설정된 앱 비밀번호
    },
  });

  // 이메일 발송 내용 설정
  const mailOptions = {
    from: process.env.EMAIL_USER, // 보내는 이메일
    to: userEmail, // 받는 이메일
    subject: "비밀번호 변경 안내", // 이메일 제목
    text: "구글 계정 연동 시 생성된 로컬 계정의 비밀번호를 설정하려면 아래 링크를 클릭해주세요.",
  };

  // 이메일 전송 시도
  try {
    await transporter.sendMail(mailOptions);
    console.log("비밀번호 변경 메일 전송 완료");
  } catch (error) {
    console.error("비밀번호 변경 메일 전송 실패:", error);
  }
}

module.exports = { sendPasswordResetEmail }; // 객체로 내보내기
