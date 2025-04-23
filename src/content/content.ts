// Detect LinkedIn post creation areas
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const postBox = document.querySelector('.share-box-feed-entry__trigger') as HTMLElement;
    if (postBox) {
      postBox.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'postCreationStarted' });
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});

// Handle messages from extension
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'injectContent') {
    const editor = document.querySelector('.ql-editor') as HTMLElement;
    if (editor) {
      editor.innerHTML = request.content;
    }
  }
});