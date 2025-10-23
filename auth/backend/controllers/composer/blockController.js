// backend/controllers/composer/blockController.js

const BlockComposer = require("../../models/composer/blockComposer");

// [GET] /api/composer/block : 최신 BlockComposer 이력 로드
exports.getBlockData = async (req, res, next) => {
// 💡 1. 미인증 유저 처리: 401 Unauthorized 반환 (DB 이력 로드 권한 없음)
    if (!req.user) {
        console.log("[BlockController] Unauthenticated user access. Returning 401.");
        // JWT/세션이 없으므로, DB 이력 조회 권한 없음(401)을 알림
        return res.status(401).json({ message: "Unauthenticated. Access to saved data denied." });
    }

    // 인증된 사용자 (req.user != null): DB 조회
    try {
        const userId = req.user._id; 
        console.log(`[DEBUG - Block] Attempting to load data for userId: ${userId}`); 
        
        // 1. 해당 유저의 최신 이력 1개 조회
        const latestData = await BlockComposer.findOne({ userId: userId })
            .sort({ updatedAt: -1 }) 
            .limit(1);

// 💡 2. 데이터 없음 처리: 204 No Content 반환 (인증 O, 데이터 X)
        if (!latestData) {
            console.log(`[DEBUG - Block] No data found for userId: ${userId}. Returning 204.`);
            return res.status(204).send(); // 응답 본문 없음
        }        

console.log(`[DEBUG - Block] Data loaded successfully for userId: ${userId}. Returning 200.`);

// 3. 데이터 있음 처리: 200 OK와 Local Storage 구조 데이터 반환
        const responseData = {
            workspace: latestData.workspace,
            options: latestData.options,
            transcript: latestData.transcript,
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error loading BlockComposer data:", error);
        // 서버 내부 오류: 500 Internal Server Error 반환
        res.status(500).json({ message: "Internal server error during data loading." });
    }
};

// [POST] /api/composer/block : BlockComposer 데이터 저장 (인증 필수)
exports.saveBlockData = async (req, res, next) => {
    // 참고: 이 라우트에는 authMiddleware가 적용되어, 미인증 유저는 401을 받고 여기서 실행되지 않습니다.
    try {
        const userId = req.user._id; 
        const { workspace, options, transcript } = req.body;

        if (!workspace || !options || !transcript) {
            return res.status(400).json({ message: "필수 데이터(workspace, options, transcript)가 누락되었습니다." });
        }
        const result = await BlockComposer.findOneAndUpdate(
            { userId: userId }, // 쿼리: 해당 userId를 가진 문서를 찾습니다.
            {
                // 업데이트할 내용
                userId: userId, 
                workspace: workspace,
                options: options,
                transcript: transcript
            },
            {
                new: true, // 업데이트된 문서를 반환 (선택 사항)
                upsert: true, // 💡 없으면 새로 생성 (중요!)
                runValidators: true // 업데이트 시 스키마 유효성 검사 실행
            }
        );
        if (result) {
	    console.log(`[DEBUG - Block] Save/Update successful for userId: ${userId}. Status: 200`);
            return res.status(200).json({ message: "BlockComposer 데이터가 성공적으로 저장/업데이트되었습니다." });
        }

        // 이 블록에 도달하면 findOneAndUpdate에 문제가 있었던 경우
        return res.status(500).json({ message: "데이터 저장/업데이트에 실패했습니다." });

    } catch (error) {
        console.error("Error saving BlockComposer data:", error);
        next(error);
    }
};
