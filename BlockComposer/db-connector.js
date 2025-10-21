/**
 * 파일 위치: BlockComposer/db-connector.js
 * 이 스크립트는 Block Composer IDE의 Local Storage와 백엔드 DB 간의 데이터 동기화를 처리합니다.
 * Block Composer는 workspace 데이터를 포함하며, Local Storage 키는 "BlockComposer"를 사용합니다.
 */

const BLOCK_COMPOSER_KEY = "BlockComposer";
const API_LOAD_URL = "/api/composer/block";
const API_SAVE_URL = "/api/composer/block";
const AUTO_SAVE_INTERVAL_MS = 10000;

// --- IDE 강제 로드 함수 ---
// 실제 IDE와 연결 시 이 함수 내부를 IDE 렌더링 함수로 대체할 것
function reloadIDEFromLocalStorage() {
    const localData = localStorage.getItem(BLOCK_COMPOSER_KEY);
    if (localData) {
        // 예: const parsedData = JSON.parse(localData);
        // 예: loadBlocklyWorkspace(parsedData.workspace); 
        console.log("[DB Connector] IDE reload triggered from Local Storage.");
    }
}

// --- DB 로드 함수 (GET) ---
async function loadUserData() {
    console.log("[DB Connector] Attempting to load block data from DB...");
    try {
        const response = await fetch(API_LOAD_URL, {
            method: 'GET',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[DB Connector] Load failed, status:", response.status, "message:", data.message);

            if (data.message === "Unauthenticated. Use demo mode.") {
                console.log("[DB Connector] User not authenticated. Clearing Local Storage for privacy.");
                localStorage.removeItem(BLOCK_COMPOSER_KEY);
            }

            return false;
        }

        // 정상적인 데이터일 경우에만 localStorage 저장
        if (data.message) {
            console.log(`[DB Connector] ${data.message}. Using Local Storage default.`);
            return false;
        }

        console.log("[DB Connector] Successfully loaded latest block data from DB. Overwriting Local Storage.");
	console.log(data);
        localStorage.setItem(BLOCK_COMPOSER_KEY, JSON.stringify(data));
        return true;

    } catch (error) {
        console.error("[DB Connector] Error during block DB load:", error);
        return false;
    }
}



// --- DB 저장 함수 (POST, 자동 저장) ---
async function autoSaveData() {
    const localData = localStorage.getItem(BLOCK_COMPOSER_KEY);
    if (!localData) return;

    try {
        const response = await fetch(API_SAVE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: localData,
        });

        if (response.status === 401) {
            console.log("[DB Connector] Save failed: User is not authenticated. Stopping auto-save.");
            clearInterval(window.__autoSaveTimer);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[DB Connector] Save failed on server:", errorData.message);
            return;
        }

        console.log("[DB Connector] Block auto-save successful. Triggering IDE reload.");
        reloadIDEFromLocalStorage();

    } catch (error) {
        console.error("[DB Connector] Error during block auto-save API call:", error);
    }
}

// --- 초기 실행 순서: DB → LocalStorage → IDE 로드 ---
(async () => {
    const loadedFromDB = await loadUserData();  // DB에서 먼저 시도
    reloadIDEFromLocalStorage();                // DB 결과와 상관없이 로컬 데이터 로드

    // 10초마다 자동 저장 시작
    window.__autoSaveTimer = setInterval(autoSaveData, AUTO_SAVE_INTERVAL_MS);
})();

// 페이지 떠날 때 마지막 저장
window.addEventListener('beforeunload', () => {
    autoSaveData();
});
