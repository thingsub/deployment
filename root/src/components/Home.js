import React from "react";
import "../styles.css";

const Home = () => (
  <div className="home-container">
    {/* 배경 비디오 추가 */}
    <video className="background-video" autoPlay loop muted>
      <source
        src={`${process.env.PUBLIC_URL}/videos/gameplay.mp4`}
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>

    {/* 콘텐츠 */}
    <div className="home-content" id="home"></div>
  </div>
);

export default Home;
