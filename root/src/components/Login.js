import React from "react";
import "../styles.css";

const Login = ({ closeModal }) => {
  return (
    <div className="login-modal">
      <div className="login-modal-content">
        <h2>소셜 로그인</h2>
        <button className="social-login kakao">
          <img src="/images/kakao.png" alt="Kakao Logo" />
          카카오 로그인
        </button>
        <button className="social-login google">
          <img src="/images/google.png" alt="Google Logo" />
          구글 로그인
        </button>
        <button onClick={closeModal}>Close</button> {/* 모달 닫기 */}
      </div>
    </div>
  );
};

export default Login;
