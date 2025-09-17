// src/styles/googleCallbackStyles.js
import styled from "styled-components";

// 스타일: 컨테이너
export const Container = styled.div`
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.bgColor};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

// 스타일: 메시지 텍스트
export const Message = styled.p`
  font-size: 1.2rem;
  color: ${(props) => props.theme.primaryColor};
  margin-top: 20px;
`;
