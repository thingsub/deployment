const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd, // 운영환경에만 true
  sameSite: isProd ? "none" : "lax", // 운영환경은 none, 개발은 lax
  maxAge: 60 * 60 * 1000, // 1시간
};

module.exports = { cookieOptions };
