export interface Landmark {
  x: number; // normalized [0, 1]
  y: number;
  z: number;
}

export interface RawHand {
  landmarks: Landmark[];
  confidence: number;
}

export interface Hand extends RawHand {
  fingersExtended: boolean[]; // [thumb, index, middle, ring, pinky]
}

export interface HandDetectionResult {
  hands: Hand[];
  fps: number;
  timestamp: number;
}

