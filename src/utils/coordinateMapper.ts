import { Landmark } from '../types/hand.types';

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
 */
export async function findWindowAtPoint(
  screenX: number,
  screenY: number
): Promise<chrome.windows.Window | null> {
  try {
    const windows = await chrome.windows.getAll({ populate: false });
    
    for (const win of windows) {
      if (win.left !== undefined && win.top !== undefined && 
          win.width !== undefined && win.height !== undefined) {
        if (
          screenX >= win.left &&
          screenX <= win.left + win.width &&
          screenY >= win.top &&
          screenY <= win.top + win.height
        ) {
          return win;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding window:', error);
    return null;
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

