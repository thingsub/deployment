const express = require("express");
const router = express.Router();
// 💡 강제 인증 (DB 저장 시 사용)
const authMiddleware = require("../middlewares/authMiddleware");
// 💡 선택적 인증 (DB 로드 시 사용)
const composerMiddleware = require("../middlewares/composerMiddleware"); 

const blockController = require("../controllers/composer/blockController");
const scriptController = require("../controllers/composer/scriptController");


// BlockComposer 라우트: /api/composer/block
// GET (로드): composerMiddleware를 통해 인증 여부 확인 후 컨트롤러로 전달
router.get("/block", composerMiddleware, blockController.getBlockData);
// POST (저장): DB 저장은 인증 필수 (미인증 시 authMiddleware가 401로 차단)
router.post("/block", authMiddleware, blockController.saveBlockData);


// ScriptComposer 라우트: /api/composer/script
// GET (로드): composerMiddleware 적용
router.get("/script", composerMiddleware, scriptController.getScriptData);
// POST (저장): authMiddleware 적용
router.post("/script", authMiddleware, scriptController.saveScriptData);

module.exports = router;
