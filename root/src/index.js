import React from "react";
import ReactDOM from "react-dom/client"; // React 18 이상에서 사용
import "./styles.css";
import App from "./App";

// root element에 React 앱을 렌더링
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
