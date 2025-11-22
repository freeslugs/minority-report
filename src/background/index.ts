import { MessageType, ExtensionMessage, GestureEvent } from '../types/message.types';

let overlayWindowId: number | null = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: false,
    debugMode: true,
    cameraId: 'default',
    onboardingCompleted: false
  });
});

/**
 * Create singleton overlay window
 */
async function createOverlayWindow(): Promise<number | null> {
  if (overlayWindowId !== null) {
    // Check if window still exists
    try {
      await chrome.windows.get(overlayWindowId);
      return overlayWindowId;
    } catch {
      // Window was closed, reset ID
      overlayWindowId = null;
    }
  }
  
  try {
    // For now, we'll inject overlay into active tab instead of separate window
    // This is simpler and avoids permission issues
    // The singleton behavior is maintained by checking if overlay already exists
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: MessageType.ENABLE_EXTENSION
        }).catch(() => {
          // Tab might not have content script loaded yet
        });
      }
    });
    
    // Return a dummy ID to indicate overlay is "created"
    overlayWindowId = -1; // Special value indicating overlay is active
    console.log('[HandWave] Overlay enabled (singleton mode)');
    return overlayWindowId;
  } catch (error) {
    console.error('[HandWave] Failed to enable overlay:', error);
    return null;
  }
}

/**
 * Close overlay window
 */
async function closeOverlayWindow(): Promise<void> {
  if (overlayWindowId !== null) {
    // Notify all tabs to remove overlay
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: MessageType.DISABLE_EXTENSION
          }).catch(() => {});
        }
      });
    });
    
    overlayWindowId = null;
    console.log('[HandWave] Overlay disabled');
  }
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  // Handle enable/disable extension
  if (message.type === MessageType.ENABLE_EXTENSION) {
    createOverlayWindow().then(() => {
      // Notify all tabs that extension is enabled
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, message).catch(() => {
              // Tab might not have content script loaded yet, ignore error
            });
          }
        });
      });
    });
    return true;
  }
  
  if (message.type === MessageType.DISABLE_EXTENSION) {
    closeOverlayWindow().then(() => {
      // Notify all tabs that extension is disabled
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, message).catch(() => {});
          }
        });
      });
    });
    return true;
  }
  
  // Handle gesture events from overlay
  if (message.type === MessageType.GESTURE_DETECTED) {
    const gesture = message.payload as GestureEvent;
    
    if (gesture.gesture === 'swipe_up' || gesture.gesture === 'swipe_down') {
      // Send scroll command to active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: MessageType.SCROLL_PAGE,
            payload: { direction: gesture.gesture === 'swipe_up' ? 'down' : 'up' }
          }).catch(() => {});
        }
      });
    } else if (gesture.gesture === 'pinch') {
      // Handle pinch to minimize
      // This will be handled by the overlay sending window ID
      chrome.runtime.sendMessage({
        type: MessageType.MINIMIZE_WINDOW,
        payload: gesture.data
      }).catch(() => {});
    }
    
    return true;
  }
  
  // Handle window highlight
  if (message.type === MessageType.HIGHLIGHT_WINDOW) {
    // Route to content script for visual feedback
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
      }
    });
    return true;
  }
  
  // Handle minimize window
  if (message.type === MessageType.MINIMIZE_WINDOW) {
    if (message.payload?.windowId) {
      chrome.windows.update(message.payload.windowId, { state: 'minimized' }).catch(() => {});
    }
    return true;
  }
  
  return true;
});

// Clean up on extension unload
chrome.runtime.onSuspend.addListener(() => {
  closeOverlayWindow();
});

