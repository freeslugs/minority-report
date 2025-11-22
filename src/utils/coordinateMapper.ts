import { Landmark } from '../types/hand.types';
import { MessageType } from '../types/message.types';

/**
 * Map camera coordinates to screen coordinates
 * Camera view is 640x480, screen can be any size
 */
export function mapCameraToScreen(
  cameraPoint: Landmark,
  screenWidth: number,
  screenHeight: number
): { x: number; y: number } {
  return {
    x: cameraPoint.x * screenWidth,
    y: cameraPoint.y * screenHeight
  };
}

/**
 * Find which window a hand is pointing at
 * Note: This must be called via message to background worker since chrome.windows API
 * is only available there. Use findWindowAtPointViaMessage instead.
 */
export async function findWindowAtPoint(
  _screenX: number,
  _screenY: number
): Promise<chrome.windows.Window | null> {
  // This function is deprecated - use findWindowAtPointViaMessage instead
  // which sends a message to background worker
  return null;
}

/**
 * Find window at point by sending message to background worker
 */
export interface WindowInfo {
  window: chrome.windows.Window | null;
  url?: string;
  title?: string;
}

export async function findWindowAtPointViaMessage(
  screenX: number,
  screenY: number
): Promise<WindowInfo> {
  try {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: MessageType.FIND_WINDOW_AT_POINT,
          payload: { x: screenX, y: screenY }
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error finding window:', chrome.runtime.lastError);
            resolve({ window: null });
          } else {
            resolve({
              window: response?.window || null,
              url: response?.url,
              title: response?.title
            });
          }
        }
      );
    });
  } catch (error) {
    console.error('Error finding window:', error);
    return { window: null };
  }
}

/**
 * Get screen dimensions
 */
export function getScreenDimensions(): { width: number; height: number } {
  return {
    width: window.screen.width,
    height: window.screen.height
  };
}

