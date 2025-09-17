// src/styles/accountStyles.js
import styled from "styled-components";
import {
  Container as CommonContainer,
  Title as CommonTitle,
} from "./commonStyles"; // 공통 컨테이너 가져오기

// 계정 설정 페이지 스타일
export const AccountContainer = styled(CommonContainer)`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

// 공통 Title 확장 (크기만 조정)
export const Title = styled(CommonTitle)`
  font-size: 2rem;
`;

// 비밀번호 메시지 등
export const PasswordMessage = styled.p`
  color: blue;
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

// 프로필 섹션 스타일
export const ProfileContainer = styled(CommonContainer)`
  border: 1px solid #ddd;
  background-color: #f9fafb;
  padding: 1rem;
`;

// 공통 Title 변형 (h3 크기)
export const ProfileTitle = styled(CommonTitle.withComponent("h3"))`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const ProfileInfo = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1rem;

  strong {
    font-weight: bold;
  }
`;
