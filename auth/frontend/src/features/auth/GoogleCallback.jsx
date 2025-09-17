// src/features/auth/GoogleCallback.jsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { googleCallback } from "../../api/auth"; // API 모듈 import
import { Container, Message } from "../../styles/GoogleCallbackStyles";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sendCodeToBackend = async () => {
      const code = searchParams.get("code");
      if (!code) {
        console.error("코드 없음");
        navigate("/login");
        return;
      }

      try {
        const response = await googleCallback(code);

        if (response.status === 200) {
          const user = response.data;
          if (user.provider === "google" && !user.password) {
            navigate("/account-settings"); // 비밀번호 설정 페이지
          } else {
            navigate("/home");
          }
        } else {
          throw new Error("로그인 실패");
        }
      } catch (err) {
        console.error("구글 로그인 실패:", err);
        navigate("/login");
      }
    };

    sendCodeToBackend();
  }, [navigate, searchParams]);

  return (
    <Container>
      <Message>로그인 처리 중입니다...</Message>
    </Container>
  );
};

export default GoogleCallback;
