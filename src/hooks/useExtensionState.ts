import { useState, useEffect } from 'react';

export function useExtensionState() {
  const [enabled, setEnabled] = useState(false);
  const [debugMode, setDebugMode] = useState(true); // default on for Phase 1
  
  useEffect(() => {
    // Load from chrome.storage.sync
    chrome.storage.sync.get(['enabled', 'debugMode'], (result) => {
      setEnabled(result.enabled ?? false);
      setDebugMode(result.debugMode ?? true);
    });
  }, []);
  
  const updateState = (key: string, value: any) => {
    chrome.storage.sync.set({ [key]: value });
    if (key === 'enabled') {
      setEnabled(value);
    } else if (key === 'debugMode') {
      setDebugMode(value);
    }
  };
  
  return { enabled, debugMode, updateState };
}

