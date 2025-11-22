import { Landmark } from '../types/hand.types';

const FINGER_INDICES = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20]
};

export function isFingerExtended(landmarks: Landmark[], fingerName: keyof typeof FINGER_INDICES): boolean {
  const indices = FINGER_INDICES[fingerName];
  const tip = landmarks[indices[3]];
  const pip = landmarks[indices[1]];
  
  // Finger extended if tip Y < PIP Y (higher on screen, accounting for normalization)
  const threshold = 0.05;
  return tip.y < pip.y - threshold;
}

export function detectFingerStates(landmarks: Landmark[]): boolean[] {
  return [
    isFingerExtended(landmarks, 'thumb'),
    isFingerExtended(landmarks, 'index'),
    isFingerExtended(landmarks, 'middle'),
    isFingerExtended(landmarks, 'ring'),
    isFingerExtended(landmarks, 'pinky')
  ];
}

