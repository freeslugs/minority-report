import { MessageType, ExtensionMessage } from '../types/message.types';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: false,
    debugMode: true,
    cameraId: 'default',
    onboardingCompleted: false
  });
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  // Relay messages between popup and content scripts
  if (message.type === MessageType.ENABLE_EXTENSION || 
      message.type === MessageType.DISABLE_EXTENSION) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
          // Tab might not have content script loaded yet, ignore error
        });
      }
    });
  }
  return true; // Keep message channel open for async response
});

