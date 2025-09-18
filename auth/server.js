require("dotenv").config(); // 환경변수 로드
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./backend/routes/authRoutes"); // 인증 라우트 불러오기
const db = require("./backend/database/db"); // DB 연결 모듈 불러오기
const app = express();
const path = require("path"); // path 모듈 추가
const http = require("http"); // HTTP 서버 모듈 추가
const server = http.createServer(app); // HTTP 서버 생성
const cookieParser = require("cookie-parser");

const cors = require("cors");

const isProd = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProd ? "https://rbmate.com" : "http://localhost:3000",
    methods: "GET,POST",
    credentials: true, // 쿠키를 허용할 경우
  })
);

app.use(cookieParser());

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. 당신의 인증 API 라우팅을 먼저 처리
// 이렇게 해야 auth로 시작하는 요청이 정적 파일로 처리되지 않습니다.
app.use("/auth", authRoutes);

// 2. 당신의 React 앱(SPA)을 루트 경로('/')에 서비스
app.use("/", express.static(path.join(__dirname, "frontend", "build")));

// 3. 기존 컴포저들을 위한 정적 파일 서빙
// 루트 경로에 대한 라우팅이 정의된 이후에 이 라우팅을 정의해야 합니다.
// 이렇게 하면 /BlockComposer와 /ScriptComposer 경로의 요청이 올바르게 처리됩니다.

app.use(
  "/BlockComposer",
  express.static(path.join(__dirname, "..", "BlockComposer"))
); // path.join(__dirname, "..", "BlockComposer") <-- 수정
app.use(
  "/ScriptComposer",
  express.static(path.join(__dirname, "..", "ScriptComposer"))
); // path.join(__dirname, "..", "ScriptComposer") <-- 수정

// 에러 핸들링 미들웨어

app.use((err, req, res, next) => {
  console.error("서버 오류:", err.stack || err);
  res.status(500).json({
    success: false,
    message: isProd ? "서버 오류가 발생했습니다." : err.message,
  });
});

// DB 연결
db.connect();

// // 서버 실행
// const port = process.env.PORT || 20001; // Nginx에서 포워드하는 포트

// server.listen(port, "0.0.0.0", () => {
//   console.log("Hello World");
// });

// // 서버 실행 (로컬 환경에서는 3000 포트로 설정)
// const port = process.env.PORT || 3002; // 로컬에서 사용할 포트 번호

// server.listen(port, "localhost", () => {
//   // 로컬에서는 localhost로 바인딩
//   console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
// });

// 배포용 서버 코드를 활성화합니다.
const port = process.env.PORT || 20001; // 회사에서 지정한 포트
server.listen(port, "0.0.0.0", () => {
  console.log(`서버가 http://0.0.0.0:${port}에서 실행 중입니다.`);
});
