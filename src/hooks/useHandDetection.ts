import { useState, useEffect, RefObject, useRef } from 'react';
import { detectHands } from '../utils/handDetection';
import { detectFingerStates } from '../utils/fingerState';
import { Hand } from '../types/hand.types';
import { FRAME_SKIP_THRESHOLD_MS } from '../shared/constants';
import { detectGestures, createSwipeTracker, SwipeTracker } from '../utils/gestureRecognizer';
import { getWindowForHand, highlightWindow, minimizeWindow, getHighlightedWindowId } from '../utils/windowManager';
import { MessageType, GestureEvent } from '../types/message.types';

export function useHandDetection(videoRef: RefObject<HTMLVideoElement>) {
  const [hands, setHands] = useState<Hand[]>([]);
  const [fps, setFps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const swipeTrackersRef = useRef<Map<number, SwipeTracker>>(new Map());
  const lastPinchStateRef = useRef<Map<number, boolean>>(new Map());
  const lastWindowIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isRunning || !videoRef.current) return;
    
    let animationId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let skipCounter = 0;
    
    const detectionLoop = async () => {
      const startTime = performance.now();
      
      try {
        const detectedHands = await detectHands(videoRef.current!);
        
        // Process finger states
        const processedHands = detectedHands.map(hand => ({
          ...hand,
          fingersExtended: detectFingerStates(hand.landmarks)
        }));
        
        setHands(processedHands);
        
        // Gesture detection and window management
        for (let i = 0; i < processedHands.length; i++) {
          const hand = processedHands[i];
          
          // Get or create swipe tracker for this hand
          if (!swipeTrackersRef.current.has(i)) {
            swipeTrackersRef.current.set(i, createSwipeTracker());
          }
          const tracker = swipeTrackersRef.current.get(i)!;
          
          // Detect gestures
          const gesture = detectGestures(hand, tracker);
          
          // Window selection: map hand to window
          const targetWindow = await getWindowForHand(hand);
          if (targetWindow && targetWindow.id !== undefined && targetWindow.id !== lastWindowIdRef.current) {
            const windowId = targetWindow.id;
            await highlightWindow(windowId);
            lastWindowIdRef.current = windowId;
            
            // Send highlight message
            chrome.runtime.sendMessage({
              type: MessageType.HIGHLIGHT_WINDOW,
              payload: { windowId }
            }).catch(() => {});
          }
          
          // Handle pinch gesture
          if (gesture.type === 'pinch') {
            const wasPinching = lastPinchStateRef.current.get(i) || false;
            if (!wasPinching && gesture.confidence > 0.7) {
              // Pinch just started - minimize highlighted window
              const highlightedId = getHighlightedWindowId();
              if (highlightedId) {
                await minimizeWindow(highlightedId);
                chrome.runtime.sendMessage({
                  type: MessageType.MINIMIZE_WINDOW,
                  payload: { windowId: highlightedId }
                }).catch(() => {});
              }
            }
            lastPinchStateRef.current.set(i, true);
          } else {
            lastPinchStateRef.current.set(i, false);
          }
          
          // Handle swipe gestures
          if (gesture.type === 'swipe_up' || gesture.type === 'swipe_down') {
            if (gesture.confidence > 0.5) {
              const gestureEvent: GestureEvent = {
                gesture: gesture.type,
                handIndex: i,
                data: gesture.data
              };
              
              chrome.runtime.sendMessage({
                type: MessageType.GESTURE_DETECTED,
                payload: gestureEvent
              }).catch(() => {});
            }
          }
        }
        
        // Clean up trackers for hands that are no longer detected
        if (processedHands.length < swipeTrackersRef.current.size) {
          for (let i = processedHands.length; i < swipeTrackersRef.current.size; i++) {
            swipeTrackersRef.current.delete(i);
            lastPinchStateRef.current.delete(i);
          }
        }
        
        // Calculate FPS
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          lastTime = now;
        }
        
        // Frame skipping for performance
        const processingTime = now - startTime;
        if (processingTime > FRAME_SKIP_THRESHOLD_MS) {
          skipCounter++;
          if (skipCounter < 2) {
            animationId = requestAnimationFrame(detectionLoop);
            return;
          }
        }
        skipCounter = 0;
      } catch (error) {
        console.error('Hand detection error:', error);
      }
      
      animationId = requestAnimationFrame(detectionLoop);
    };
    
    detectionLoop();
    
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, videoRef]);
  
  return { hands, fps, isRunning, setIsRunning };
}

