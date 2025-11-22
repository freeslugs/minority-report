import { Hand } from '../types/hand.types';
import { MessageType } from '../types/message.types';
import { mapCameraToScreen, findWindowAtPointViaMessage, getScreenDimensions, WindowInfo } from './coordinateMapper';

let highlightedWindowId: number | null = null;
let highlightedWindowInfo: { url?: string; title?: string } | null = null;
let highlightOverlay: HTMLDivElement | null = null;

/**
 * Highlight a window with a visual border
 * Sends message to background worker since chrome.windows API is only available there
 */
export async function highlightWindow(windowId: number): Promise<void> {
  // Remove previous highlight
  if (highlightedWindowId !== null && highlightedWindowId !== windowId) {
    removeHighlight();
  }
  
  if (highlightedWindowId === windowId) {
    return; // Already highlighted
  }
  
  highlightedWindowId = windowId;
  
  // Send message to background worker to handle window operations
  chrome.runtime.sendMessage({
    type: MessageType.HIGHLIGHT_WINDOW_REQUEST,
    payload: { windowId }
  }).catch(() => {});
  
  console.log(`[HandWave] Highlighting window ${windowId}`);
}

/**
 * Remove window highlight
 */
export function removeHighlight(): void {
  if (highlightedWindowId !== null) {
    console.log(`[HandWave] Removing highlight from window ${highlightedWindowId}`);
    highlightedWindowId = null;
    highlightedWindowInfo = null;
  }
  
  if (highlightOverlay) {
    highlightOverlay.remove();
    highlightOverlay = null;
  }
}

/**
 * Minimize a window
 * Sends message to background worker since chrome.windows API is only available there
 */
export async function minimizeWindow(windowId: number): Promise<void> {
  chrome.runtime.sendMessage({
    type: MessageType.MINIMIZE_WINDOW,
    payload: { windowId }
  }).catch(() => {});
  
  console.log(`[HandWave] Minimizing window ${windowId}`);
  removeHighlight();
}

/**
 * Get the window that a hand is pointing at
 */
export async function getWindowForHand(hand: Hand): Promise<WindowInfo> {
  const screen = getScreenDimensions();
  const wrist = hand.landmarks[0];
  const screenPoint = mapCameraToScreen(wrist, screen.width, screen.height);
  
  const result = await findWindowAtPointViaMessage(screenPoint.x, screenPoint.y);
  
  // Store window info for display
  if (result.window && result.window.id) {
    highlightedWindowInfo = {
      url: result.url,
      title: result.title
    };
  }
  
  return result;
}

/**
 * Get currently highlighted window ID
 */
export function getHighlightedWindowId(): number | null {
  return highlightedWindowId;
}

/**
 * Get currently highlighted window info (URL/title)
 */
export function getHighlightedWindowInfo(): { url?: string; title?: string } | null {
  return highlightedWindowInfo;
}

