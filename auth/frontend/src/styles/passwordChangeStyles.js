// src/styles/passwordChangeStyles.js
import styled from "styled-components";

// 컨테이너 스타일
export const Container = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.bgColor};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 제목 스타일
export const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 15px;
  color: ${(props) => props.theme.primaryColor};
`;

// 비밀번호 관련 안내 텍스트
export const InfoText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.infoTextColor};
  margin-bottom: 20px;
`;

// 비밀번호 입력 필드와 관련된 스타일
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

// 비밀번호 보이기/숨기기 버튼
export const ToggleVisibilityButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.primaryColor};
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  align-self: flex-start;
`;

// 메시지 출력 스타일
export const Message = styled.p`
  color: ${(props) => props.theme.errorColor};
  font-size: 1rem;
  margin-top: 10px;
`;