// src/features/auth/GoogleCallback.jsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { googleCallback } from "../../api/auth"; // API 모듈 import
import { Container, Message } from "../../styles/GoogleCallbackStyles";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
      const code = searchParams.get("code");
      if (!code) {
        console.error("코드 없음");
        navigate("/login");
        return;
      }

    // 백엔드로 인증 코드 보내기
    googleCallback(code)
      .then(() => {
        // 백엔드에서 리다이렉트되었으므로, 자동으로 프론트엔드 페이지로 이동
        // 예: /auth/home
        navigate("/auth/home");
      })
      .catch((error) => {
        console.error("로그인 실패:", error);
        navigate("/login");
      });

  }, [navigate, searchParams]);

  return (
    <Container>
      <Message>로그인 처리 중입니다...</Message>
    </Container>
  );
};

export default GoogleCallback;
