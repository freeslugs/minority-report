import { useState, useEffect, RefObject } from 'react';
import { detectHands } from '../utils/handDetection';
import { detectFingerStates } from '../utils/fingerState';
import { Hand } from '../types/hand.types';
import { FRAME_SKIP_THRESHOLD_MS } from '../shared/constants';

export function useHandDetection(videoRef: RefObject<HTMLVideoElement>) {
  const [hands, setHands] = useState<Hand[]>([]);
  const [fps, setFps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
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

