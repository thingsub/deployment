/**
 * BlockComposer/db-connector.js
 * Local Storage ↔ 백엔드 DB ↔ IDE 간 동기화 + 인증 상태 감지 + 기본값 fallback
 */

const BLOCK_COMPOSER_KEY = "BlockComposer";
const API_LOAD_URL = "/api/composer/block";
const API_SAVE_URL = "/api/composer/block";
const AUTO_SAVE_INTERVAL_MS = 10000; // 10초마다 저장

// 🧱 기본값 템플릿 (로그아웃 시 사용)
const DEFAULT_BLOCK_DATA = {
    "workspace": {
        "blocks": {
            "languageVersion": 0,
            "blocks": [
                { "type": "setup", "id": "default-setup", "x": 184, "y": 50, "deletable": false, "editable": false },
                { "type": "loop", "id": "default-loop", "x": 734, "y": 50, "deletable": false, "editable": false }
            ]
        }
    },
    "options": { "script": null, "console": null, "lang": "ko", "view": "connect" },
    "transcript": {
        "javascript": "// put setup code here, to run once:\nasync function setup() {\n}\n\n// put control code here, to run repeatedly:\nfunction loop() {\n}\n",
        "python": "import asyncio\n\n# put setup code here, to run once:\nasync def setup():\n\tpass\n\n# put control code here, to run repeatedly:\ndef loop():\n\tpass\n"
    }
};

// 🪝 IDE에 강제로 로드하는 래퍼
function reloadIDEFromLocalStorage() {
    const localData = localStorage.getItem(BLOCK_COMPOSER_KEY);
    if (localData) {
        console.log("[DB Connector] IDE reload triggered.");
        // 실제 IDE 로드 함수로 대체 필요
        // const parsed = JSON.parse(localData);
        // loadBlocklyWorkspace(parsed.workspace);
    }
}

// 🍪 현재 인증 상태 확인 (토큰 쿠키 존재 여부로 판단)
function isAuthenticated() {
    return document.cookie.includes("token=");
}

// 🧹 LocalStorage를 기본 템플릿으로 초기화
function resetLocalStorageToDefault() {
    localStorage.setItem(BLOCK_COMPOSER_KEY, JSON.stringify(DEFAULT_BLOCK_DATA));
    console.log("[DB Connector] LocalStorage reset to default template.");
    reloadIDEFromLocalStorage();
}

// 📥 DB에서 사용자 데이터 불러오기
async function loadUserData() {
    console.log("[DB Connector] Attempting to load block data from DB...");

    // 토큰이 없으면 바로 기본값 초기화 후 종료
    if (!isAuthenticated()) {
        console.log("[DB Connector] No token found. Using default template.");
        resetLocalStorageToDefault();
        return;
    }

    try {
        const response = await fetch(API_LOAD_URL, {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            console.warn("[DB Connector] Load failed. Resetting to default.");
            resetLocalStorageToDefault();
            return;
        }

        const data = await response.json();

        if (data.message) {
            console.log(`[DB Connector] ${data.message}. Using default template.`);
            resetLocalStorageToDefault();
            return;
        }

        console.log("[DB Connector] Loaded user data. Updating Local Storage.");
        localStorage.setItem(BLOCK_COMPOSER_KEY, JSON.stringify(data));
        reloadIDEFromLocalStorage();
    } catch (error) {
        console.error("[DB Connector] Error during DB load:", error);
        resetLocalStorageToDefault();
    }
}

// 💾 DB에 자동 저장
async function autoSaveData() {
    const localData = localStorage.getItem(BLOCK_COMPOSER_KEY);
    if (!localData) return;

    if (!isAuthenticated()) {
        console.log("[DB Connector] No token. Stopping auto-save.");
        resetLocalStorageToDefault();
        clearInterval(window.__autoSaveTimer);
        return;
    }

    try {
        const response = await fetch(API_SAVE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: localData,
        });

        if (response.status === 401) {
            console.log("[DB Connector] 401 Unauthorized. Resetting.");
            resetLocalStorageToDefault();
            clearInterval(window.__autoSaveTimer);
            return;
        }

        if (!response.ok) {
            const err = await response.json();
            console.error("[DB Connector] Save failed:", err.message);
            return;
        }

        console.log("[DB Connector] Auto-save successful.");
        reloadIDEFromLocalStorage();
    } catch (error) {
        console.error("[DB Connector] Error during auto-save:", error);
    }
}

// 🚀 초기화
loadUserData();
window.__autoSaveTimer = setInterval(autoSaveData, AUTO_SAVE_INTERVAL_MS);
window.addEventListener("beforeunload", autoSaveData);
