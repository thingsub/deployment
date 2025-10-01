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

    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google/callback?code=${code}`;
  }, [navigate, searchParams]);

  return (
    <Container>
      <Message>로그인 처리 중입니다...</Message>
    </Container>
  );
};

export default GoogleCallback;
