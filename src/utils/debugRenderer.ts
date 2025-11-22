import { Hand, Landmark } from '../types/hand.types';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // index
  [0, 9], [9, 10], [10, 11], [11, 12], // middle
  [0, 13], [13, 14], [14, 15], [15, 16], // ring
  [0, 17], [17, 18], [18, 19], [19, 20], // pinky
  [5, 9], [9, 13], [13, 17] // palm connections
];

export function drawHandSkeleton(ctx: CanvasRenderingContext2D, hand: Hand, color: string, handIndex: number = 0) {
  // Use different colors for left (blue) and right (red) hands
  const handColor = handIndex === 0 ? '#3b82f6' : '#ef4444';
  ctx.strokeStyle = color || handColor;
  ctx.lineWidth = 2;
  
  HAND_CONNECTIONS.forEach(([start, end]) => {
    const startPoint = hand.landmarks[start];
    const endPoint = hand.landmarks[end];
    
    ctx.beginPath();
    ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
    ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
    ctx.stroke();
  });
}

export function drawLandmarkIndices(ctx: CanvasRenderingContext2D, landmarks: Landmark[]) {
  ctx.fillStyle = 'white';
  ctx.font = '10px monospace';
  
  landmarks.forEach((landmark, idx) => {
    const x = landmark.x * ctx.canvas.width;
    const y = landmark.y * ctx.canvas.height;
    
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillText(idx.toString(), x + 5, y - 5);
  });
}

