import { Hand } from '../types/hand.types';
import { mapCameraToScreen, findWindowAtPoint, getScreenDimensions } from './coordinateMapper';

let highlightedWindowId: number | null = null;
let highlightOverlay: HTMLDivElement | null = null;

/**
 * Highlight a window with a visual border
 */
export async function highlightWindow(windowId: number): Promise<void> {
  // Remove previous highlight
  if (highlightedWindowId !== null && highlightedWindowId !== windowId) {
    removeHighlight();
  }
  
  if (highlightedWindowId === windowId) {
    return; // Already highlighted
  }
  
  try {
    const window = await chrome.windows.get(windowId);
    if (!window.left || !window.top || !window.width || !window.height) {
      return;
    }
    
    // Create highlight overlay (we'll inject this into the window's content)
    // For now, we'll use chrome.windows.update to add a visual indicator
    // In a real implementation, you'd inject a border overlay into the window
    
    highlightedWindowId = windowId;
    
    // Store highlight info for removal
    console.log(`[HandWave] Highlighting window ${windowId}`);
  } catch (error) {
    console.error('Error highlighting window:', error);
  }
}

/**
 * Remove window highlight
 */
export function removeHighlight(): void {
  if (highlightedWindowId !== null) {
    console.log(`[HandWave] Removing highlight from window ${highlightedWindowId}`);
    highlightedWindowId = null;
  }
  
  if (highlightOverlay) {
    highlightOverlay.remove();
    highlightOverlay = null;
  }
}

/**
 * Minimize a window
 */
export async function minimizeWindow(windowId: number): Promise<void> {
  try {
    await chrome.windows.update(windowId, { state: 'minimized' });
    console.log(`[HandWave] Minimized window ${windowId}`);
    removeHighlight();
  } catch (error) {
    console.error('Error minimizing window:', error);
  }
}

/**
 * Get the window that a hand is pointing at
 */
export async function getWindowForHand(hand: Hand): Promise<chrome.windows.Window | null> {
  const screen = getScreenDimensions();
  const wrist = hand.landmarks[0];
  const screenPoint = mapCameraToScreen(wrist, screen.width, screen.height);
  
  return await findWindowAtPoint(screenPoint.x, screenPoint.y);
}

/**
 * Get currently highlighted window ID
 */
export function getHighlightedWindowId(): number | null {
  return highlightedWindowId;
}

