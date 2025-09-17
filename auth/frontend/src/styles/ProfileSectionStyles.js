// src/styles/profileSectionStyles.js
import styled from "styled-components";

// 스타일: 프로필 섹션 컨테이너
export const Container = styled.section`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9fafb;
  max-width: 600px;
  margin: 0 auto;
`;

// 스타일: 제목
export const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${(props) => props.theme.primaryColor};
`;

// 스타일: 정보 텍스트
export const Info = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1rem;

  strong {
    font-weight: bold;
  }
`;
