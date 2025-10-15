// src/features/account/AccountSettingsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, getAccountMappingStatus } from "../../api/auth";
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

  // fetchUserData를 useCallback으로 감싸기
  const fetchUserData = useCallback(async () => {
    try {
      const userRes = await getUserInfo();
      if (!userRes.data) throw new Error("유저 정보 없음");

      setUserData(userRes.data);

      const mappingRes = await getAccountMappingStatus();
      if (mappingRes?.data?.success) {
        const mapping = mappingRes.data;
        setMappingStatus(mapping.mappingStatus);
        setLocalUser(mapping.localUser);

        // 비밀번호 없으면 폼 보이기, 있으면 안 보이기
        if (
          mapping.mappingStatus === "local_account" &&
          (!mapping.localUser || !mapping.localUser.password || mapping.localUser.password === "")
        ) {
          setShowPasswordForm(true);
        } else {
          setShowPasswordForm(false);
        }
      }
    } catch (err) {
      console.error("유저 정보 또는 매핑 상태 불러오기 실패:", err);
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePasswordSetSuccess = async () => {
    await fetchUserData(); // 최신 상태로 다시 불러오기
    setShowPasswordForm(false); // 폼 닫기
  };

  if (isLoading) return <p>사용자 정보를 불러오는 중...</p>;
  if (!userData) return null;

  const { name, email, provider } = userData;

  const passwordTargetUser =
    mappingStatus === "local_account" ? localUser : userData;

  const canChangePassword =
    provider === "google" &&
    mappingStatus === "local_account" &&
    (!passwordTargetUser?.password || passwordTargetUser.password === "");

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

        {canChangePassword && (
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
                onSuccess={handlePasswordSetSuccess}
              />
            )}
          </>
        )}

        {(provider === "local" ||
          (mappingStatus === "local_account" &&
            passwordTargetUser?.password &&
            passwordTargetUser.password !== "")) && (
          <PasswordChangeSection user={passwordTargetUser} />
        )}
      </div>

      <HomeButton onClick={() => navigate("/home")}>홈으로</HomeButton>
    </Container>
  );
};

export default AccountSettingsPage;
