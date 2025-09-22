// src/api/auth.js

import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// 사용자 정보 가져오기
export const getUserInfo = () => api.get("/auth/me");

// 계정 매핑 상태 확인
export const checkAccountMapping = () => api.get("/auth/check-account-mapping");

// 로그아웃
export const logoutUser = () => api.get("/auth/logout");

// 로컬 비밀번호 설정/변경
export const setLocalPassword = (password) =>
  api.post("/auth/set-local-password", { password });

// 구글 콜백 처리 (code 보내기)
export const googleCallback = (code) => {
  return api.get(`/auth/google/callback?code=${code}`);
};

export const getAccountMappingStatus = () =>
  api.get("/auth/check-account-mapping");
