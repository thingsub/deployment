// src/App.jsx

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { getUserInfo } from "./api/auth"; // 모듈화된 API 함수 import
import styled from "styled-components"; // styled-components import
import { ThemeProvider } from "styled-components"; // ThemeProvider 임포트
import { theme } from "./styles/theme"; // 테마 import

import Login from "./features/auth/Login";
// import Register from "./features/auth/Register";
import GoogleCallback from "./features/auth/GoogleCallback";
import Home from "./features/home/Home";
import AccountSettingsPage from "./features/account/AccountSettingsPage";

// 로딩 중 상태를 스타일링
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: ${(props) => props.theme.primaryColor};
`;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    getUserInfo()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return (
      <LoadingContainer>
        <div>로딩 중...</div>
      </LoadingContainer>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/home" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route
            path="/home"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/account-settings"
            element={
              isAuthenticated ? (
                <AccountSettingsPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
