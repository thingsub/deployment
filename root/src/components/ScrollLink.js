import React from "react";
import { Link } from "react-router-dom";

// ScrollLink 컴포넌트는 특정 섹션으로 이동하는 역할을 합니다.
const ScrollLink = ({ to, children }) => (
  <Link to={to} smooth>
    {children}
  </Link>
);

export default ScrollLink;
