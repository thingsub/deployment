// src/styles/oauthSuccessStyles.js
import styled from "styled-components";

// 스타일: OAuth 처리 중 메시지
export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.primaryColor};
  background-color: ${(props) => props.theme.bgColor};
`;
