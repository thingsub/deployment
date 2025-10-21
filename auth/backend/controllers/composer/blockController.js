// backend/controllers/composer/blockController.js

const BlockComposer = require("../../models/composer/blockComposer");

// [GET] /api/composer/block : 최신 BlockComposer 이력 로드
exports.getBlockData = async (req, res, next) => {
    // 💡 변경: req.user가 null이면 DB 조회 없이 데모 모드 응답
    if (!req.user) {
        console.log("[BlockController] Unauthenticated user access. Returning demo mode signal.");
        // 미인증 유저: 200 OK와 함께 데이터 없음 메시지 반환. 프론트엔드는 Local Storage 사용.
        return res.status(200).json({ message: "Unauthenticated. Use demo mode." }); 
    }

    // 인증된 사용자 (req.user != null): DB 조회
    try {
        const userId = req.user._id; 
        console.log(`[DEBUG - Block] Attempting to load data for userId: ${userId}`); // 👈 디버깅 로그 추가
        
        // 1. 해당 유저의 최신 이력 1개 조회
        const latestData = await BlockComposer.findOne({ userId: userId })
            .sort({ updatedAt: -1 }) 
            .limit(1);

        if (!latestData) {
            console.log(`[DEBUG - Block] No data found for userId: ${userId}`); // 👈 디버깅 로그 추가
            // 저장된 데이터가 없는 경우
            return res.status(200).json({ message: "No saved data found." });
        }
        
        console.log(`[DEBUG - Block] Data loaded successfully for userId: ${userId}.`); // 👈 디버깅 로그 추가

        // 2. Local Storage 형식에 맞는 데이터만 추출하여 응답
        const responseData = {
            workspace: latestData.workspace,
            options: latestData.options,
            transcript: latestData.transcript, 
        };
        
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error loading BlockComposer data:", error);
        next(error); 
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
        
        // 💡 핵심 수정: findOneAndUpdate와 upsert: true를 사용하여 덮어쓰기 또는 최초 생성 수행
        const result = await BlockComposer.findOneAndUpdate(
            { userId: userId }, // 쿼리: 해당 userId를 가진 문서를 찾습니다.
            { 
                // 업데이트할 내용
                userId: userId, // (필요시)
                workspace: workspace, 
                options: options, 
                transcript: transcript 
		updatedAt: latestData.updatedAt,
            }, 
            { 
                new: true, // 업데이트된 문서를 반환 (선택 사항)
                upsert: true, // 💡 없으면 새로 생성 (중요!)
                runValidators: true // 업데이트 시 스키마 유효성 검사 실행
            }
        );

        if (result) {
            // 새 문서가 생성되었거나(201) 업데이트되었거나(200) 모두 성공으로 처리
            const status = result.isNew ? 201 : 200;
            console.log(`[DEBUG - Block] Save/Update successful for userId: ${userId}. Status: ${status}`); // 👈 디버깅 로그 추가
            return res.status(status).json({ message: "BlockComposer 데이터가 성공적으로 저장/업데이트되었습니다." });
        }

        // 이 블록에 도달하면 findOneAndUpdate에 문제가 있었던 경우
        return res.status(500).json({ message: "데이터 저장/업데이트에 실패했습니다." });

    } catch (error) {
        console.error("Error saving BlockComposer data:", error);
        next(error);
    }
};
