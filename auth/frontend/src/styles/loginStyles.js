// src/styles/loginStyles.js
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${(props) => props.theme.bgColor};
`;

export const LoginBox = styled.div`
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: ${(props) => props.theme.primaryColor};
`;

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

export const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: 15px;
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${(props) => props.theme.primaryColor};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:disabled {
    background-color: ${(props) => props.theme.disabledColor};
    cursor: not-allowed;
  }
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

