// backend/controllers/composer/scriptController.js
const ScriptComposer = require("../../models/composer/scriptComposer");

// [GET] /api/composer/script : 최신 ScriptComposer 이력 로드
exports.getScriptData = async (req, res, next) => {
    // 💡 composerMiddleware 적용 시 인증 체크: req.user가 null이면 DB 조회 없이 데모 모드 응답
    if (!req.user) {
        console.log("[ScriptController] Unauthenticated user access. Returning demo mode signal.");
        // 미인증 유저: 200 OK와 함께 데이터 없음 메시지 반환. 프론트엔드는 Local Storage 사용.
        return res.status(200).json({ message: "Unauthenticated. Use demo mode." }); 
    }

    // 인증된 사용자 (req.user != null): DB 조회
    try {
        const userId = req.user._id; 
        console.log(`[DEBUG - Script] Attempting to load data for userId: ${userId}`); // 👈 디버깅 로그 추가
        
        // 1. 해당 유저의 최신 이력 1개 조회 (최신 데이터를 확실히 가져오도록 .sort().limit(1) 복원)
        const latestData = await ScriptComposer.findOne({ userId: userId })
             .sort({ updatedAt: -1 }) // 가장 최근 업데이트된 항목을 먼저 정렬
             .limit(1);                // 1개만 가져옴

        if (!latestData) {
            console.log(`[DEBUG - Script] No data found for userId: ${userId}`); // 👈 디버깅 로그 추가
            // 저장된 데이터가 없는 경우
            return res.status(200).json({ message: "No saved data found." });
        }
        
        console.log(`[DEBUG - Script] Data loaded successfully for userId: ${userId}.`); // 👈 디버깅 로그 추가

        // 2. Local Storage Value 형식에 맞는 데이터만 추출하여 응답
        const responseData = {
            options: latestData.options,
            transcript: latestData.transcript, 
        };
        
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error loading ScriptComposer data:", error);
        next(error);
    }
};


// [POST] /api/composer/script : ScriptComposer 데이터 저장 (인증 필수)
exports.saveScriptData = async (req, res, next) => {
    // 참고: 이 라우트는 authMiddleware가 적용되어, req.user의 존재가 보장됩니다.
    try {
        const userId = req.user._id; 
        // req.body는 Local Storage의 "ScriptComposer" value를 통째로 보냈다고 가정
        const { options, transcript } = req.body;

        if (!options || !transcript) {
            return res.status(400).json({ message: "필수 데이터(options, transcript)가 누락되었습니다." });
        }
        
        // 💡 핵심 수정: findOneAndUpdate와 upsert: true를 사용하여 덮어쓰기 또는 최초 생성 수행
        const result = await ScriptComposer.findOneAndUpdate(
            { userId: userId }, // 쿼리: 해당 userId를 가진 문서를 찾습니다.
            { 
                // 업데이트할 내용
                userId: userId, 
                options: options, 
                transcript: transcript 
            }, 
            { 
                new: true, 
                upsert: true, // 💡 없으면 새로 생성 (중요!)
                runValidators: true 
            }
        );

        if (result) {
            // 새 문서가 생성되었거나(201) 업데이트되었거나(200) 모두 성공으로 처리
            const status = result.isNew ? 201 : 200;
            console.log(`[DEBUG - Script] Save/Update successful for userId: ${userId}. Status: ${status}`); // 👈 디버깅 로그 추가
            return res.status(status).json({ message: "ScriptComposer 데이터가 성공적으로 저장/업데이트되었습니다." });
        }

        // 이 블록에 도달하면 findOneAndUpdate에 문제가 있었던 경우
        return res.status(500).json({ message: "데이터 저장/업데이트에 실패했습니다." });

    } catch (error) {
        console.error("Error saving ScriptComposer data:", error);
        next(error);
    }
};
