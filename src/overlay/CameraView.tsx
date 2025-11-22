import { useEffect, RefObject } from 'react';
import { Hand } from '../types/hand.types';
import { drawHandSkeleton, drawLandmarkIndices } from '../utils/debugRenderer';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  stream: MediaStream | null;
  hands: Hand[];
  debugMode: boolean;
}

export function CameraView({ videoRef, canvasRef, stream, hands, debugMode }: Props) {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);
  
  // Draw skeleton on canvas
  useEffect(() => {
    if (!canvasRef.current || !debugMode) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    hands.forEach((hand, idx) => {
      const color = idx === 0 ? '#3b82f6' : '#ef4444'; // blue or red
      drawHandSkeleton(ctx, hand, color, idx);
      drawLandmarkIndices(ctx, hand.landmarks);
    });
  }, [hands, debugMode, canvasRef]);
  
  return (
    <div className="relative w-[640px] h-[480px]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}

