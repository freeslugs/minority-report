import React from 'react';
import { createRoot } from 'react-dom/client';
import { OverlayApp } from '../overlay/OverlayApp';
import { MessageType, ExtensionMessage } from '../types/message.types';
import '../index.css';

let overlayRoot: HTMLDivElement | null = null;
let reactRoot: ReturnType<typeof createRoot> | null = null;

function injectOverlay() {
  if (!overlayRoot) {
    overlayRoot = document.createElement('div');
    overlayRoot.id = 'handwave-overlay-root';
    document.body.appendChild(overlayRoot);
    
    reactRoot = createRoot(overlayRoot);
    reactRoot.render(<OverlayApp />);
  }
}

function removeOverlay() {
  if (overlayRoot) {
    reactRoot?.unmount();
    overlayRoot.remove();
    overlayRoot = null;
    reactRoot = null;
  }
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === MessageType.ENABLE_EXTENSION) {
    injectOverlay();
  } else if (message.type === MessageType.DISABLE_EXTENSION) {
    removeOverlay();
  }
});

// Check initial state on page load
chrome.storage.sync.get(['enabled'], (result) => {
  if (result.enabled) {
    // Wait for DOM to be ready
    if (document.body) {
      injectOverlay();
    } else {
      window.addEventListener('DOMContentLoaded', injectOverlay);
    }
  }
});

