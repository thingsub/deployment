// src/features/home/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { getUserInfo, checkAccountMapping, logoutUser } from "../../api/auth";
import { getUserInfo, checkAccountMapping} from "../../api/auth";

import {
  Container,
  Title,
  WelcomeText,
  Button
//  ,LogoutButton,
} from "../../styles/homePageStyles"; // 스타일 import

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [mappingStatus, setMappingStatus] = useState(null);
  const [localUserInfo, setLocalUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo && !loading) {
      navigate("/login");
    }
  }, [loading, userInfo, navigate]);

  useEffect(() => {
    getUserInfo()
      .then((res) => {
        if (!res.data) throw new Error("No user data");
        setUserInfo(res.data);
        return checkAccountMapping();
      })
      .then((res) => {
        if (res?.data?.success) {
          setMappingStatus(res.data.mappingStatus);
          setLocalUserInfo(res.data.localUser || null);
        }
      })
      .catch((err) => {
        console.error("유저 정보 요청 실패:", err);
        navigate("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

//  const handleLogout = () => {
//    logoutUser()
//      .then(() => {
//        setUserInfo(null);
//        setMappingStatus(null);
//        setLocalUserInfo(null);
//        navigate("/login");
//      })
//      .catch((err) => {
//        console.error("로그아웃 실패:", err);
//        navigate("/login");
//      });
//  };

  if (loading || mappingStatus === null) return <p>로딩 중...</p>;
  if (!userInfo) return null;

  return (

  <Container>
    <Title>Profile</Title>

    <div>
      <WelcomeText>환영합니다, {userInfo.name || userInfo.id}님!</WelcomeText>
      <p>
        로그인 방식: {userInfo.provider === "google" ? "Google" : "Local"}
      </p>

      {/* 구글 로그인 상태 */}
      {userInfo.provider === "google" && (
        <>

          {(mappingStatus === "not_mapped" ||
            (mappingStatus === "local_account" &&
              (!localUserInfo || !localUserInfo.password))) && (
            <div>
              <p>
                구글 계정으로 로그인하셨지만, 로컬 계정이 매핑되지 않았습니다.
              </p>

              <Button onClick={() => navigate("/account-settings")}>
                비밀번호 설정하기
              </Button>
            </div>
          )}

          {(mappingStatus === "mapped" ||
            (mappingStatus === "local_account" && localUserInfo?.password)) && (
            <div>
              <p>구글 계정과 로컬 계정이 매핑되었습니다.</p>
              <Button onClick={() => navigate("/account-settings")}>
                계정 설정
              </Button>
            </div>
          )}
        </>
      )}

      {/* 로컬 계정 로그인 */}
      {userInfo.provider === "local" && mappingStatus === "local_account" && (
        <div>
          <p>로컬 계정으로 로그인되었습니다.</p>
          <Button onClick={() => navigate("/account-settings")}>
            계정 설정
          </Button>
        </div>
      )}

      {/* 버튼들을 감싸는 flex 박스 */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <Button onClick={() => (window.location.href = "/")}>
          메인화면으로
        </Button>
        {/*<LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>*/}
      </div>
    </div>
  </Container>
);



};

export default Home;
