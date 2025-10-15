// src/features/account/components/PasswordChangeSection.jsx

import React, { useState } from "react";
import { setLocalPassword } from "../../../api/auth";
import { Button, Input, Label } from "../../../styles/commonStyles"; // 공통 스타일 import
import {
  Container,
  Title,
  InfoText,
  ToggleVisibilityButton,
  Form,
  Message,
} from "../../../styles/passwordChangeStyles"; // PasswordChangeSection 스타일 import
const PasswordChangeSection = ({ user, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  if (!user) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await setLocalPassword(password);
      setMessage(res.data.message || "비밀번호가 성공적으로 변경되었습니다.");
      setPassword("");
      setPasswordConfirm("");

      setTimeout(() => { 
if (onSuccess) onSuccess();
},5000);
	
}
catch (err) {
      console.error("Password change error", err);
      setMessage("비밀번호 변경 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>로컬 계정 비밀번호 설정</Title>

      {user.provider === "google" && !user.password && (
        <InfoText>
          구글 계정 연동 시, 로컬 비밀번호를 설정하면 로컬 로그인도 가능합니다.
        </InfoText>
      )}

      <Form onSubmit={handlePasswordChange}>
        <div>
          <Label>새 비밀번호:</Label>
          <Input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <ToggleVisibilityButton
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? "숨기기" : "보기"}
          </ToggleVisibilityButton>
        </div>

        <div>
          <Label>비밀번호 확인:</Label>
          <Input
            type={passwordConfirmVisible ? "text" : "password"}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          <ToggleVisibilityButton
            type="button"
            onClick={() => setPasswordConfirmVisible(!passwordConfirmVisible)}
          >
            {passwordConfirmVisible ? "숨기기" : "보기"}
          </ToggleVisibilityButton>
        </div>

        <Button
          type="submit"
          disabled={
            isLoading ||
            !password ||
            !passwordConfirm ||
            password !== passwordConfirm
          }
        >
          {isLoading ? "비밀번호 변경 중..." : "비밀번호 변경"}
        </Button>
      </Form>

      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default PasswordChangeSection;
