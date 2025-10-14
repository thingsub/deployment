import React, { useState, useEffect, useRef } from "react";
import { HashLink } from "react-router-hash-link";

const sections = [
  { name: "BlockComposer", id: "blockcomposer" },
  { name: "Contact", id: "contact" },
  { name: "Login", id: "login-section" },
];

const NavBar = ({ toggleLoginModal }) => {
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);
  const timeoutId = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        // 아래로 스크롤 → 즉시 숨김
        if (showNav) {
          setShowNav(false);
        }
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
        }
      } else {
        // 위로 스크롤 → 보이기
        if (!showNav) {
          setShowNav(true);
        }
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
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
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    };
  }, [showNav]); // showNav 상태에 의존하도록 추가

return (
  <div className={`Nav_bar ${showNav ? "visible" : "hidden"}`}>
    <HashLink to="/#home" className="logo">
      <img src={`${process.env.PUBLIC_URL}/Images/sky_long.png`} alt="Logo" className="logo-image" />
    </HashLink>

    <div className="nav-links">
      {sections.map((section) =>
        section.name === "Login" ? (
          <a
            key={section.id}
            href="https://rbmtl.com/auth"
            style={{ color: "white", textDecoration: "none", padding: "10px 20px" }}
          >
            {section.name}
          </a>
        ) : (
          <HashLink key={section.id} to={`/#${section.id}`} smooth>
            {section.name}
          </HashLink>
        )
      )}
    </div>
  </div>
);

};

export default NavBar;
