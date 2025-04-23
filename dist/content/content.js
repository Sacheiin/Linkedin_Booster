/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!****************************************!*\
  !*** ./src/content_scripts/content.ts ***!
  \****************************************/

console.log('LinkedIn Booster Content Script Loaded');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'analyzePost') {
        const posts = Array.from(document.querySelectorAll('[data-test-id="post-content"]'));
        sendResponse({ posts: posts.length });
    }
    return true;
});
if (window.location.hostname.includes('linkedin.com')) {
    console.log('LinkedIn detected, initializing extension features');
    chrome.runtime.sendMessage({ type: 'contentScriptReady' });
}

/******/ })()
;
//# sourceMappingURL=content.js.map