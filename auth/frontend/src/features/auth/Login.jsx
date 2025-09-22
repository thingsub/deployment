// src/Components/Login.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "./components/GoogleLoginButton";
import {
  Container,
  LoginBox,
  Title,
  InputGroup,
  Button,
  Divider,
  ErrorMessage,
 
} from "../../styles/loginStyles"; // 스타일 import

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordExists, setPasswordExists] = useState(true); // 비밀번호 설정 여부
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3002/api/auth/me", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) navigate("/home");
      })
      .catch(() => {
        console.log("로그인되지 않은 상태입니다.");
      });
  }, [navigate]);

  // id가 변경될 때마다 비밀번호 존재 여부 확인
  useEffect(() => {
    if (!id) {
      setPasswordExists(true); // id가 비어있으면 일단 true로 초기화
      return;
    }

    const checkPasswordExists = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3002/api/auth/check-password/${encodeURIComponent(id)}`,
          { withCredentials: true }
        );
        // 서버에서 비밀번호 존재 여부 boolean 반환 가정
        setPasswordExists(res.data.passwordExists);
      } catch (error) {
        // 에러 시 기본 true로 두거나 적절히 처리
        setPasswordExists(true);
      }
    };

    checkPasswordExists();
  }, [id]);

  const loginUser = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (!passwordExists) {
      setErrorMessage(
        "이 계정은 비밀번호가 설정되어 있지 않습니다. 구글 로그인 또는 비밀번호 설정을 진행해주세요."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/api/auth/login",
        { id, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/home");
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 400) {
        setErrorMessage("로그인 실패: 잘못된 ID 또는 비밀번호입니다.");
      } else if (status === 403) {
        setErrorMessage("구글 연동 계정은 비밀번호 로그인 불가입니다.");
      } else {
        setErrorMessage(
          error.response?.data?.message || "서버 오류가 발생했습니다."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    const { googleId, email, name } = googleResponse.profileObj;

    try {
      const response = await axios.post(
        "http://localhost:3002/api/auth/account-mapping",
        { googleId, email, name },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/home");
      }
    } catch (error) {
      setErrorMessage("구글 계정과 로컬 계정 매핑에 실패했습니다.");
      console.error("구글 로그인 매핑 오류:", error);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    setErrorMessage("구글 로그인에 실패했습니다.");
    console.error("구글 로그인 실패:", error);
  };

  return (
    <Container>
      <LoginBox>
        <Title>로그인</Title>

        <form onSubmit={loginUser}>
          <InputGroup>
            <label htmlFor="id">아이디</label>
            <input
              type="text"
              id="id"
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!passwordExists}
            />
          </InputGroup>

          {!passwordExists && (
            <ErrorMessage>
              이 계정은 비밀번호가 설정되어 있지 않습니다.{" "}
              <a href="/account-settings">비밀번호 설정</a>을 먼저 진행해주세요.
            </ErrorMessage>
          )}

          <Button
            type="submit"
            disabled={!id || !password || isSubmitting || !passwordExists}
          >
            로그인
          </Button>
        </form>
        <Divider>
          <div className="line"></div>
          <span>or</span>
          <div className="line"></div>
        </Divider>

        <GoogleLoginButton
          onSuccess={handleGoogleLoginSuccess}
          onFailure={handleGoogleLoginFailure}
        />

        {/* <p className="register-link">
          계정이 없으신가요? <a href="/register">회원가입</a>
        </p> */}
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </LoginBox>
    </Container>
  );
};

export default Login;
