import { createRoot } from 'react-dom/client';
import { OverlayApp } from '../overlay/OverlayApp';
import { MessageType, ExtensionMessage } from '../types/message.types';
import '../index.css';

// Singleton overlay - only one instance across all tabs
let overlayRoot: HTMLDivElement | null = null;
let reactRoot: ReturnType<typeof createRoot> | null = null;

function injectOverlay() {
  // Check if overlay already exists (singleton check)
  if (overlayRoot && document.getElementById('handwave-overlay-root')) {
    console.log('[HandWave] Overlay already exists (singleton)');
    return;
  }
  
  if (!overlayRoot) {
    console.log('[HandWave] Injecting singleton overlay...');
    overlayRoot = document.createElement('div');
    overlayRoot.id = 'handwave-overlay-root';
    document.body.appendChild(overlayRoot);
    
    reactRoot = createRoot(overlayRoot);
    reactRoot.render(<OverlayApp />);
    console.log('[HandWave] Overlay injected successfully');
  }
}

function removeOverlay() {
  if (overlayRoot) {
    reactRoot?.unmount();
    overlayRoot.remove();
    overlayRoot = null;
    reactRoot = null;
    console.log('[HandWave] Overlay removed');
  }
}

let scrollInterval: number | null = null;

function scrollPage(direction: 'up' | 'down', velocity: number = 100) {
  // Stop any existing scroll
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
  }
  
  const scrollAmount = Math.min(velocity / 10, 50); // Max 50px per scroll
  const scrollStep = direction === 'down' ? scrollAmount : -scrollAmount;
  
  scrollInterval = window.setInterval(() => {
    window.scrollBy(0, scrollStep);
  }, 16); // ~60fps scrolling
  
  // Stop scrolling after a short time
  setTimeout(() => {
    if (scrollInterval !== null) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  }, 200);
}

function stopScrolling() {
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === MessageType.ENABLE_EXTENSION) {
    // Only inject if not already present (singleton)
    if (!document.getElementById('handwave-overlay-root')) {
      if (document.body) {
        injectOverlay();
      } else {
        window.addEventListener('DOMContentLoaded', injectOverlay);
      }
    }
  } else if (message.type === MessageType.DISABLE_EXTENSION) {
    removeOverlay();
    stopScrolling();
  } else if (message.type === MessageType.SCROLL_PAGE) {
    const { direction, velocity } = message.payload || { direction: 'down', velocity: 100 };
    scrollPage(direction, velocity);
  } else if (message.type === MessageType.HIGHLIGHT_WINDOW) {
    // Visual feedback for window highlighting
    console.log('[HandWave] Window highlighted:', message.payload?.windowId);
  }
  
  return true;
});

// Check initial state on page load
chrome.storage.sync.get(['enabled'], (result) => {
  if (result.enabled && !document.getElementById('handwave-overlay-root')) {
    if (document.body) {
      injectOverlay();
    } else {
      window.addEventListener('DOMContentLoaded', injectOverlay);
    }
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  stopScrolling();
});

