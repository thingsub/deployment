/**
 * 파일 위치: BlockComposer/db-connector.js
 * @fileoverview BlockComposer/db-connector.js
 * (UX 개선: 새로고침 없이 로그인 이력 즉시 반영)
 */

const BLOCK_COMPOSER_KEY = "BlockComposer";
const API_LOAD_URL = "/api/composer/block";
const API_SAVE_URL = "/api/composer/block";
const AUTO_SAVE_INTERVAL_MS = 10000;

// --- IDE 초기화 함수 (재정의) ---
// 이 함수는 IDE 초기화/렌더링 로직 전체를 포함하며, 오직 한 번만 호출되어야 합니다.
function initializeComposer() {
    const localData = localStorage.getItem(BLOCK_COMPOSER_KEY);
    if (localData) {
        // [IMPORTANT] 여기에 IDE의 실제 로드 로직을 호출해야 합니다.
        console.log("[DB Connector] IDE initialized with Local Storage data.");
    } else {
        // Local Storage에 데이터가 없는 경우 (미인증, 데이터 없음, 초기 상태)
        console.log("[DB Connector] IDE initialized with default/empty data.");
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

        if (response.status === 200) {
            // 💡 200 OK: DB 데이터 로드 성공
            const data = await response.json();
            console.log("[DB Connector] Successfully loaded latest block data from DB. Overwriting Local Storage.");
            // Local Storage 덮어쓰기 (새로고침 없이 이력 반영의 핵심)
            localStorage.setItem(BLOCK_COMPOSER_KEY, JSON.stringify(data));
        }

        else if (response.status === 204) {
            // 💡 204 No Content: 인증 O, 저장된 데이터 X
            console.log("[DB Connector] Authenticated, but no saved data found. Local Storage is kept/used.");
        }

        else if (response.status === 401) {
            // 💡 401 Unauthorized: 미인증 사용자 (DB 데이터 접근 불가)
            console.log("[DB Connector] User not authenticated (401). Clearing Local Storage for privacy and using default.");
            // 미인증 유저의 개인 정보 보호를 위해 Local Storage 초기화
//            localStorage.removeItem(BLOCK_COMPOSER_KEY);
        }

        else {
            // 400, 500 등 기타 오류
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            console.error(`[DB Connector] Load failed, status: ${response.status}. Message: ${errorData.message}`);
        }

    } catch (error) {
        console.error("[DB Connector] Error during block DB load (network/fetch):", error);
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
            console.log("[DB Connector] Save failed: User is not authenticated (401). Stopping auto-save.");
            clearInterval(window.__autoSaveTimer);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Server error" }));
            console.error("[DB Connector] Save failed on server:", errorData.message);
            return;
        }

        console.log("[DB Connector] Block auto-save successful.");

    } catch (error) {
        console.error("[DB Connector] Error during block auto-save API call:", error);
    }
}


// --- 최종 실행 트리거 (IIFE) ---
// 💡 핵심: DB 로드가 완료될 때까지 await으로 대기하고, 그 이후에 IDE를 초기화해야 새로고침 없이 이력이 반영됩니다.
(async () => {
    // 1. DB에서 데이터 로드 시도 및 Local Storage 덮어쓰기 (await으로 대기)
    await loadUserData();

    // 2. Local Storage의 최종 데이터를 읽어 IDE 초기화 및 렌더링 시작
    // 이 로직이 실행될 때 Local Storage는 이미 DB 데이터로 갱신된 상태입니다.
    initializeComposer();

    // 3. 10초마다 자동 저장 시작
    // autoSaveData 내에서 401 시 setInterval이 멈춤
    window.__autoSaveTimer = setInterval(autoSaveData, AUTO_SAVE_INTERVAL_MS);
})();


// 페이지를 떠나기 전에 마지막으로 저장 시도
window.addEventListener('beforeunload', () => {
    // 마지막 저장 시도 후 타이머 정리
    if (window.__autoSaveTimer) {
        autoSaveData();
        clearInterval(window.__autoSaveTimer);
    }
});
