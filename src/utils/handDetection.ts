import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { Hand } from '../types/hand.types';

let model: handpose.HandPose | null = null;

export async function initModel(): Promise<void> {
  await tf.setBackend('webgl');
  model = await handpose.load();
}

export async function detectHands(video: HTMLVideoElement): Promise<Hand[]> {
  if (!model) throw new Error('Model not initialized');
  
  const predictions = await model.estimateHands(video);
  
  return predictions.map(pred => ({
    landmarks: pred.landmarks.map(l => ({
      x: l[0] / video.videoWidth,
      y: l[1] / video.videoHeight,
      z: l[2]
    })),
    confidence: pred.handInViewConfidence
  }));
}

