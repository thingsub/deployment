import React, { useState, useEffect } from "react";
import styles from "../styles/Favorite.module.css";

const Favorite = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      <div className="Box2" id="favorite-section">
        <div className={styles.title}>
          <p className={styles.customTitle}>
            로보메이션은 새로운 도전과 비전의 실현을 위한 창의적인 실험실입니다.
            <br />
            로보메이션은 AI 로보틱스 SW 교육에 최적화된 플랫폼을 추구합니다.
          </p>
        </div>

        <div className={styles.contentRow}>
          {/* 이미지 세로 컬럼 */}
          <div className={styles.imageColumn}>
            <div
              className={`${styles.favor} ${
                animate ? styles.favorAnimateIn : ""
              }`}
              onClick={() =>
                (window.location.href = "https://rbmtl.com/blockcomposer")
              }
            >
              <img
                src="/Images/block.png"
                alt="CAT"
                className={`${styles.favorImg} ${
                  animate ? styles.favorAnimateIn : ""
                }`}
              />
             {/* <div className={styles.cover}>BlockComposer</div> */ }
            </div>

            <div
              className={`${styles.favor} ${
                animate ? styles.favorAnimateIn : ""
              }`}
              onClick={() =>
                (window.location.href = "https://rbmtl.com/scriptcomposer/")
              }
            >
              <img
                src={`${process.env.PUBLIC_URL}/Images/script.png`} // 스크립트 컴포저 그림 경로
                alt="Script Composer"
                className={`${styles.favorImg} ${
                  animate ? styles.favorAnimateIn : ""
                }`}
              />
              { /* <div className={styles.cover}>ScriptComposer</div> */ }
            </div>
          </div>

          {/* 설명 텍스트 */}
          <div className={styles.blockComposer}>
            <h3 className={styles.blockComposerH3}>BLOCK COMPOSER</h3>
            <p className={styles.blockComposerP}>
              블록 컴포저는 블록 코딩을 통해 로봇을 쉽고 빠르게 제어하며, <br />
              로봇 제어의 기초를 학습할 수 있는 도구입니다
            </p>
            <ol className={styles.blockComposerOl}>
              <li className={styles.blockComposerLi}>
                쉽고 직관적 – 드래그만으로 초보자도 쉽게 코딩 가능
              </li>
              <li className={styles.blockComposerLi}>
                효율적인 학습 – 기본 개념부터 문법 오류 없는 학습 환경 제공
              </li>
              <li className={styles.blockComposerLi}>
                즉시 실행 – 작성 후 바로 결과 확인 가능
              </li>
              <li className={styles.blockComposerLi}>
                AI 기반 코드 검토 – AI가 블록 코드와 스크립트를 분석해 최적화된
                피드백 제공
              </li>
              <li className={styles.blockComposerLi}>
                확장성 높은 플랫폼 – JavaScript, Python 등 스크립트로 전환 가능
              </li>
              <li className={styles.blockComposerLi}>
                창의력 향상 – 블록 조립으로 문제 해결 능력과 창의성 강화
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorite;
