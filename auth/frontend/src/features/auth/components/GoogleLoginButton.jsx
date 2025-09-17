// src/components/auth/GoogleLoginButton.jsx

import React from "react";
import GoogleIcon from "@mui/icons-material/Google";

import { GoogleLoginButton as StyledGoogleLoginButton } from "../../../styles/googleLoginButtonStyles";

const GoogleLoginButton = ({ text = "구글 로그인", className = "" }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <StyledGoogleLoginButton onClick={handleGoogleLogin} className={className}>
      <GoogleIcon className="google-icon" />
      <span>{text}</span>
    </StyledGoogleLoginButton>
  );
};

export default GoogleLoginButton;
