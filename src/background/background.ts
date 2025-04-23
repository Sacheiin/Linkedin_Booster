import { GeminiService } from '../services/gemini-api/gemini-service';

// Initialize extension storage with default values
// Chrome Extension TypeScript types
interface InstallationEvent extends chrome.runtime.InstalledDetails {
  // Type automatically inherited from chrome.runtime.InstalledDetails
}

interface ContentPreferences {
  tone: 'professional' | 'conversational';
  length: 'short' | 'medium' | 'long';
  topics: string[];
}

interface UserSettings {
  autoDraft: boolean;
  clipboardIntegration: boolean;
  validation: {
    minPostLength: number;
    maxHashtags: number;
  };
}

// Remove custom interface and use Chrome's built-in type
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  console.log('[Background] Extension installed/updated:', details.reason);
  
  // Initialize storage with type-safe defaults
  const initializeStorage = async () => {
    const defaults = await chrome.storage.local.get(['apiKey', 'contentPreferences', 'userSettings']);
    
    await chrome.storage.local.set({
      apiKey: defaults.apiKey || '',
      contentPreferences: {
        tone: defaults.contentPreferences?.tone || 'professional',
        length: defaults.contentPreferences?.length || 'medium',
        topics: defaults.contentPreferences?.topics || []
      },
      userSettings: {
        autoDraft: defaults.userSettings?.autoDraft || false,
        clipboardIntegration: defaults.userSettings?.clipboardIntegration ?? true,
        validation: {
          minPostLength: 100,
          maxHashtags: 5
        }
      }
    });
    
    chrome.storage.local.set({ lastError: null });
  };

  // Context menu setup for future LinkedIn integration
  chrome.contextMenus.create({
    id: 'generateContent',
    title: 'Generate LinkedIn Post',
    contexts: ['editable'],
    documentUrlPatterns: ['https://www.linkedin.com/*']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('[Background] Context menu error:', chrome.runtime.lastError);
      chrome.storage.local.set({ lastError: chrome.runtime.lastError.message });
    }
  });
});

// Handle messages from other extension components
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getStorageData') {
    chrome.storage.local.get(request.keys, sendResponse);
    return true;
  }
  if (request.type === 'setStorageData') {
    chrome.storage.local.set(request.data, () => sendResponse({ success: true }));
    return true;
  }
  if (request.type === 'generateContent') {
    const geminiService = GeminiService.getInstance();
    geminiService.sendRequest({ prompt: request.prompt })
      .then((content: string) => sendResponse({ content }))
      .catch((error: Error) => sendResponse({ error: error.message }));
    return true;
  }
});