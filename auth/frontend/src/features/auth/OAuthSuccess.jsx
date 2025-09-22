// src/components/auth/OAuthSuccess.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../../api/auth";
import { Container } from "../../styles/OAuthSuccessStyles";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthLogin = async () => {
      try {
        const res = await getUserInfo();
        const user = res.data;

        if (user?.provider === "google" && user?.mappingStatus !== "mapped") {
          navigate("/account-settings");
        } else {
          navigate("/home");
        }
      } catch (error) {
        console.error("OAuth 처리 실패:", error);
        navigate("/login");
      }
    };

    handleOAuthLogin();
  }, [navigate]);

  return <Container>로그인 처리 중입니다...</Container>;
};

export default OAuthSuccess;
