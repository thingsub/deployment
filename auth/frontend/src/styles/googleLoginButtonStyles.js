// src/styles/googleLoginButtonStyles.js
import styled from "styled-components";

// 구글 로그인 버튼 스타일
export const GoogleLoginButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background-color: ${(props) => props.theme.primaryColor};
  color: white;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: ${(props) => props.theme.primaryColorDark};
  }

  .google-icon {
    margin-right: 8px;
    width: 24px;
    height: 24px;
  }
`;
