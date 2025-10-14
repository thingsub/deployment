import React from "react";
import styles from "../styles/Contact.module.css"; // 모듈화된 스타일 사용

const Contact = () => (
  <div className={styles.contactWrapper}>
    <div className={styles.contactContent}>
      <div className={styles.textSection}>
        <h2>
          Robotics Education Platform,
          <br />
          Infinite Possibilities
        </h2>
        <p>
          모든 로봇을 아우르는 메타 모델링을 통해
          <br />
          디바이스 제약을 넘어선 혁신적인 제어 플랫폼을 추구합니다
        </p>
      </div>

      <div className={styles.featuresSection}>
        <div className={styles.feature}>
          <img
            src="https://robomationlab.com/wp-content/uploads/2024/11/artificial-intelligence-icon-small-02@2x.png"
            alt="무한한 가능성"
          />
          <h3>무한한 가능성</h3>
          <p>
            AI, 클라우드 기술과 결합된 로봇 제어 및 알고리즘 학습을 통해
            <br />
            지속적인 기술 진화와 창의적 혁신을 이끌며 로봇 교육의 새로운 한계를
            뛰어넘습니다
          </p>
        </div>
        <div className={styles.feature}>
          <img
            src="https://robomationlab.com/wp-content/uploads/2024/11/artificial-intelligence-icon-small-04@2x.png"
            alt="완벽히 통합된 생태계"
          />
          <h3>완벽히 통합된 생태계</h3>
          <p>
            하드웨어와 소프트웨어가 완벽히 통합된 생태계를 제공합니다.
            <br />
            사용자 친화적인 경험과 다양한 콘텐츠 간의 호환성으로 혁신적인 세계를
            경험하세요
          </p>
        </div>
        <div className={styles.feature}>
          <img
            src="https://robomationlab.com/wp-content/uploads/2024/11/Asset-1.png"
            alt="메타 모델링"
          />
          <h3>메타 모델링 방식의 혁신적인 시스템</h3>
          <p>
            로봇을 메타 모델링 방식으로 정의하고 제어할 수 있는 혁신적인 시스템,
            <br />
            한계 없는 가능성을 열어드립니다
          </p>
        </div>
      </div>
    </div>

    <div className={styles.middleImageWrapper}>
      {/* 왼쪽 이미지 */}
      <a
        href="https://robomation-shop.co.kr/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/Images/left.png" alt="Left" className={styles.sideImage} />
      </a>

      {/* 중앙 삐오 이미지 */}
      <a href="https://piorobot.com/" target="_blank" rel="noopener noreferrer">
        <img src={`${process.env.PUBLIC_URL}/Images/pio.png`} alt="Pio" className={styles.pioImage} />
      </a>

      {/* 오른쪽 이미지 */}
      <a
        href="https://robomationlab.com//"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/Images/right.png" alt="Right" className={styles.sideImage} />
      </a>
    </div>

    {/* 깃허브 아이콘 최하단 중앙 */}
    <div className={styles.footer}>
      <a
        href="https://www.youtube.com/@Robomation"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
          alt="YouTube"
          className={styles.footerIcon}
          style={{
            filter: "grayscale(100%) contrast(150%) brightness(100%)",
            width: "40px",
            height: "40px",
          }}
        />
      </a>

      <a
        href="https://github.com/RobomationLAB"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://logo.svgcdn.com/l/github.png"
          alt="GitHub"
          className={styles.githubIcon}
          width="60"
          height="60"
        />
      </a>

      <a
        href="https://robomation.net/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="/Images/sky.png"
          alt="Robomation"
          className={styles.footerIcon}
          style={{ transform: "scale(2)", marginLeft: "15px" , marginTop: "5px" }}
        />
      </a>
    </div>
  </div>
);

export default Contact;
