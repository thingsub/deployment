// src/utils/localStorageSync.js

// DB에 저장된 최근 이력을 불러와 로컬스토리지에 저장(동기화)
// 원래 composer에 들어가야 로컬스토리지가 채워져서, rbmtl.com/blockcomposer를 들어갔다 와야 채워지는 노고를 줄여보자.
export const preloadComposerToLocalStorage = (composerHistory) => {
  if (!composerHistory) return;

  // BlockComposer
  if (composerHistory.BlockComposer) {
    localStorage.setItem("BlockComposer", JSON.stringify(composerHistory.BlockComposer));
    console.log("[LocalStorage Sync] BlockComposer history loaded.");
  } else {
    console.log("[LocalStorage Sync] No BlockComposer history in DB.");
  }

  // ScriptComposer
  if (composerHistory.ScriptComposer) {
    localStorage.setItem("ScriptComposer", JSON.stringify(composerHistory.ScriptComposer));
    console.log("[LocalStorage Sync] ScriptComposer history loaded.");
  } else {
    console.log("[LocalStorage Sync] No ScriptComposer history in DB.");
  }
};
