export const FPS_TARGET = 20; // Reduced from 30 for performance
export const VIDEO_WIDTH = 640;
export const VIDEO_HEIGHT = 480;
export const FRAME_SKIP_THRESHOLD_MS = 50; // Skip frame if processing takes longer (20 FPS = 50ms per frame)
export const PINCH_THRESHOLD = 50; // pixels - increased for easier detection
export const PINCH_READY_THRESHOLD = 80; // pixels - show "ready to pinch" when fingers are close
export const SWIPE_THRESHOLD = 80; // pixels - reduced for easier detection
export const SWIPE_TIME_WINDOW = 400; // milliseconds - shorter window for more responsive

