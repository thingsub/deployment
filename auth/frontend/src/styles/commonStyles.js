// src/styles/commonStyles.js
import styled from "styled-components";

// 공통 버튼 스타일
export const Button = styled.button`
  background-color: ${(props) => props.theme.primaryColor};
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
  border: none;
  cursor: pointer;

  &:disabled {
    background-color: ${(props) => props.theme.disabledColor};
    cursor: not-allowed;
  }
`;

// 공통 인풋 스타일
export const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid ${(props) => props.theme.borderColor};
  border-radius: 4px;
  width: 100%;
  margin-top: 8px;

  &:focus {
    border-color: ${(props) => props.theme.primaryColor};
    outline: none;
  }
`;

// 공통 레이블 스타일
export const Label = styled.label`
  font-size: 1rem;
  color: ${(props) => props.theme.textColor};
`;
