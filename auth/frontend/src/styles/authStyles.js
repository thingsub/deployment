// src/styles/authStyles.js
import styled from "styled-components";
import {
  Container as CommonContainer,
  Button as CommonButton,
} from "./commonStyles";

// 로그인 페이지용 컨테이너 추가
export const LoginContainer = styled(CommonContainer)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${(props) => props.theme.bgColor};
`;

// 로그인 박스
export const LoginBox = styled.div`
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

// 로그인 버튼 (commonStyles의 Button 확장)
export const LoginButton = styled(CommonButton)`
  width: 100%;
  padding: 12px;
  border-radius: 4px;
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: ${(props) => props.theme.primaryColor};
`;

// 공통 입력 그룹 스타일 (commonStyles의 Input, Label 재사용)
export const InputGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;

  label {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid ${(props) => props.theme.borderColor};
    border-radius: 4px;
  }
`;

// 에러 메시지 스타일
export const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: 15px;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  text-align: center;

  .line {
    flex-grow: 1;
    height: 1px;
    background-color: ${(props) => props.theme.borderColor};
  }

  span {
    margin: 0 10px;
    font-size: 1rem;
  }
`;

// 구글 콜백 컨테이너 스타일
export const GoogleCallbackContainer = styled(CommonContainer)`
  max-width: 500px;
  text-align: center;
`;

// 구글 콜백 메시지 스타일
export const GoogleCallbackMessage = styled.p`
  font-size: 1.2rem;
  color: ${(props) => props.theme.primaryColor};
  margin-top: 20px;
`;

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

// 컨테이너 스타일
export const PasswordChangeContainer = styled(CommonContainer)`
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

// 제목 스타일
export const PasswordChangeTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 15px;
  color: ${(props) => props.theme.primaryColor};
`;

// 비밀번호 관련 안내 텍스트
export const PasswordChangeInfoText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.infoTextColor};
  margin-bottom: 20px;
`;

// 비밀번호 입력 필드와 관련된 스타일
export const PasswordChangeForm = styled.form`
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
export const PasswordChangeMessage = styled.p`
  color: ${(props) => props.theme.errorColor};
  font-size: 1rem;
  margin-top: 10px;
`;
