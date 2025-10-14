import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./components/Home";
import Favorite from "./components/Favorite";
import Contact from "./components/Contact";
import Login from "./components/Login"; // 로그인 모달
import NavBar from "./components/NavBar"; // 네비게이션 분리
import "./styles.css";

const ScrollToTop = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  return null;
};

const App = () => {
  const [isLoginModalVisible, setLoginModalVisible] = useState(false); // 로그인 모달 상태 관리

  // 로그인 모달 열기/닫기 함수
  const toggleLoginModal = () => setLoginModalVisible(!isLoginModalVisible);

  return (
    <Router>
      <ScrollToTop />
      <NavBar toggleLoginModal={toggleLoginModal} />{" "}
      {/* NavBar에 모달 토글 함수 전달 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {/* 로그인 모달 */}
      {isLoginModalVisible && <Login closeModal={toggleLoginModal} />}{" "}
      {/* 모달이 열려 있으면 표시 */}
      {/* 기존 섹션들 */}
      <div id="blockcomposer" className="section">
        <Favorite />
      </div>
      <div id="contact" className="section">
        <Contact />
      </div>
    </Router>
  );
};

export default App;
