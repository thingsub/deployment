// src/features/account/components/ProfileSection.jsx

import React from "react";
import { Container, Title, Info } from "../../../styles/ProfileSectionStyles";

const ProfileSection = ({ user }) => {
  if (!user) return null;

  const isGoogle = user.provider === "google";
  const isMapped = user.mappingStatus === "mapped";
  const loginMethod = isGoogle
    ? isMapped
      ? "Google 계정 (로컬 계정과 연동됨)"
      : "Google 계정 (단독)"
    : "로컬 계정";

  return (
    <Container>
      <Title>사용자 정보</Title>
      <Info>
        <strong>이름:</strong> {user.name || "정보 없음"}
      </Info>
      <Info>
        <strong>이메일:</strong> {user.email || "정보 없음"}
      </Info>
      <Info>
        <strong>로그인 방식:</strong> {loginMethod}
      </Info>
    </Container>
  );
};

export default ProfileSection;
