// src/features/account/AccountSettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getAccountMappingStatus } from "../../api/auth";
import PasswordChangeSection from "./components/PasswordChangeSection";
import {
  Container,
  Title,
  InfoText,
  PasswordMessage,
  Button,
  HomeButton,
} from "../../styles/accountSettingsPageStyles"; // 스타일 import

const AccountSettingsPage = () => {
  const [userData, setUserData] = useState(null);
  const [mappingStatus, setMappingStatus] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (!res.data) throw new Error("유저 정보 없음");
        setUserData(res.data);
        return getAccountMappingStatus();
      })
      .then((res) => {
        if (res?.data?.success) {
          setMappingStatus(res.data.mappingStatus);
          setLocalUser(res.data.localUser);
        }
      })
      .catch((err) => {
        console.error("유저 정보 또는 매핑 상태 불러오기 실패:", err);
        navigate("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  if (isLoading) return <p>사용자 정보를 불러오는 중...</p>;
  if (!userData) return null;

  const { name, email, provider } = userData;

  const passwordTargetUser =
    mappingStatus === "local_account" ? localUser : userData;

  const canChangePassword =
    mappingStatus === "local_account" && !passwordTargetUser?.password;

  return (
    <Container>
      <Title>계정 설정</Title>

      <div>
        <InfoText>
          <strong>이름:</strong> {name}
        </InfoText>
        <InfoText>
          <strong>이메일:</strong> {email}
        </InfoText>
        <InfoText>
          <strong>로그인 방식:</strong>{" "}
          {provider === "google"
            ? "Google"
            : provider === "local"
            ? "Local"
            : provider}
        </InfoText>

        {provider === "google" && canChangePassword && (
          <>
            <PasswordMessage>
              구글 계정과 연동된 로컬 계정에 비밀번호가 설정되어 있지 않습니다.{" "}
              비밀번호 설정 후 로컬 로그인이 가능합니다.
            </PasswordMessage>
            {!showPasswordForm ? (
              <Button onClick={() => setShowPasswordForm(true)}>
                비밀번호 설정하기
              </Button>
            ) : (
              <PasswordChangeSection
                user={passwordTargetUser}
                onSuccess={() => setShowPasswordForm(false)}
              />
            )}
          </>
        )}

        {(provider === "local" ||
          (mappingStatus === "local_account" &&
            passwordTargetUser?.password)) && (
          <PasswordChangeSection user={passwordTargetUser} />
        )}
      </div>

      <HomeButton onClick={() => navigate("/home")}>홈으로</HomeButton>
    </Container>
  );
};

export default AccountSettingsPage;
