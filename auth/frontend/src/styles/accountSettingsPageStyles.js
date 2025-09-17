// src/styles/accountSettingsPageStyles.js
import styled from "styled-components";

// 스타일: 계정 설정 페이지 컨테이너
export const Container = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.bgColor};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 스타일: 제목
export const Title = styled.h1`
  font-size: 2rem;
  color: ${(props) => props.theme.primaryColor};
  margin-bottom: 20px;
`;

// 스타일: 텍스트 정보
export const InfoText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.textColor};
  margin-bottom: 15px;
`;

// 스타일: 비밀번호 관련 메시지
export const PasswordMessage = styled.p`
  color: blue;
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

// 스타일: 버튼
export const Button = styled.button`
  padding: 10px 15px;
  background-color: ${(props) => props.theme.primaryColor};
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  border: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => props.theme.primaryColorDark};
  }
`;

// 스타일: 홈 버튼
export const HomeButton = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  background-color: ${(props) => props.theme.secondaryColor};
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.secondaryColorDark};
  }
`;
