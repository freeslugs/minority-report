import { Hand } from '../types/hand.types';
import { PINCH_THRESHOLD, SWIPE_THRESHOLD, SWIPE_TIME_WINDOW, VIDEO_WIDTH, VIDEO_HEIGHT } from '../shared/constants';

export interface SwipeTracker {
  positions: { y: number; time: number }[];
  threshold: number;
  timeWindow: number;
}

export interface GestureResult {
  type: 'pinch' | 'swipe_up' | 'swipe_down' | null;
  confidence: number;
  data?: any;
}

/**
 * Detect pinch gesture by measuring distance between thumb tip and index tip
 */
export function detectPinch(hand: Hand): { isPinching: boolean; distance: number } {
  const thumbTip = hand.landmarks[4];
  const indexTip = hand.landmarks[8];
  
  // Calculate distance in pixels (denormalize)
  const dx = (thumbTip.x - indexTip.x) * VIDEO_WIDTH;
  const dy = (thumbTip.y - indexTip.y) * VIDEO_HEIGHT;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return {
    isPinching: distance < PINCH_THRESHOLD,
    distance
  };
}

/**
 * Detect vertical swipe gesture by tracking wrist position over time
 */
export function detectSwipe(
  hand: Hand,
  tracker: SwipeTracker
): { direction: 'up' | 'down' | null; velocity: number } {
  const wrist = hand.landmarks[0];
  
  // Add current position
  tracker.positions.push({
    y: wrist.y,
    time: Date.now()
  });
  
  // Keep only recent positions within time window
  const now = Date.now();
  tracker.positions = tracker.positions.filter(
    p => now - p.time < tracker.timeWindow
  );
  
  if (tracker.positions.length < 2) {
    return { direction: null, velocity: 0 };
  }
  
  // Calculate delta from oldest to newest
  const oldest = tracker.positions[0];
  const newest = tracker.positions[tracker.positions.length - 1];
  const deltaY = oldest.y - newest.y; // Inverted: hand up = scroll down
  const deltaTime = newest.time - oldest.time;
  
  // Convert to pixels
  const deltaYPixels = Math.abs(deltaY * VIDEO_HEIGHT);
  const velocity = deltaYPixels / (deltaTime / 1000); // pixels per second
  
  if (deltaYPixels > tracker.threshold && deltaTime > 0) {
    return {
      direction: deltaY > 0 ? 'down' : 'up',
      velocity
    };
  }
  
  return { direction: null, velocity };
}

/**
 * Create a new swipe tracker
 */
export function createSwipeTracker(): SwipeTracker {
  return {
    positions: [],
    threshold: SWIPE_THRESHOLD,
    timeWindow: SWIPE_TIME_WINDOW
  };
}

/**
 * Detect all gestures for a hand
 */
export function detectGestures(
  hand: Hand,
  swipeTracker: SwipeTracker
): GestureResult {
  // Check for pinch
  const pinch = detectPinch(hand);
  if (pinch.isPinching) {
    return {
      type: 'pinch',
      confidence: 1 - (pinch.distance / PINCH_THRESHOLD), // Higher confidence when closer
      data: { distance: pinch.distance }
    };
  }
  
  // Check for swipe
  const swipe = detectSwipe(hand, swipeTracker);
  if (swipe.direction === 'up') {
    return {
      type: 'swipe_up',
      confidence: Math.min(swipe.velocity / 500, 1), // Normalize velocity
      data: { velocity: swipe.velocity }
    };
  } else if (swipe.direction === 'down') {
    return {
      type: 'swipe_down',
      confidence: Math.min(swipe.velocity / 500, 1),
      data: { velocity: swipe.velocity }
    };
  }
  
  return { type: null, confidence: 0 };
}

