import React, { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";

const sections = [
//  { name: "Home", id : "home"},
  { name: "BlockComposer", id: "blockcomposer" },
  { name: "Contact", id: "contact" },
];

const NavBar = () => {
  const [showNav, setShowNav] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const lastScrollY = useRef(0);
  const timeoutId = useRef(null);

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        alert("로그아웃 되었습니다.");

      // 로컬스토리지에서 BlockComposer 데이터 삭제
      localStorage.removeItem("BlockComposer");

      // 로그인 상태를 업데이트
      setIsLoggedIn(false);

      // 필요하면 페이지 새로 고침
      window.location.reload(); 

        setIsLoggedIn(false);
        // 필요하면 루트 새로고침 또는 로그인 페이지 이동
        // window.location.href = "/auth/login";
      } else {
        alert("로그아웃 실패");
      }
    } catch (err) {
      console.error("로그아웃 오류:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        if (showNav) setShowNav(false);
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
        }
      } else {
        if (!showNav) setShowNav(true);
        if (timeoutId.current) clearTimeout(timeoutId.current);
        timeoutId.current = setTimeout(() => {
          setShowNav(false);
          timeoutId.current = null;
        }, 2000);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [showNav]);

  return (
    <div className={`Nav_bar ${showNav ? "visible" : "hidden"}`}>
      <HashLink to="/#home" className="logo">
        <img src="/Images/sky_long.png" alt="Logo" className="logo-image" />
      </HashLink>

      <div className="nav-links">
        {sections.map((section) => (
          <HashLink key={section.id} to={`/#${section.id}`} smooth>
            {section.name}
          </HashLink>
        ))}

        {isLoggedIn ? (

        <>
          <button
            onClick={handleLogout}
            style={{
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "10px 20px",
              fontSize: "1em",
            }}
          >
            Logout
          </button>

          <a
            href="https://rbmtl.com/auth/home"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "10px 20px",
            }}
          >
            Profile
          </a>

</>
        ) : (
          <a
            href="https://rbmtl.com/auth/login"
            style={{
              color: "white",
              textDecoration: "none",
              padding: "10px 20px",
            }}
          >
            Login
          </a>
        )}
      </div>
    </div>
  );
};

export default NavBar;
