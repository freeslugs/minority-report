import { Hand } from '../types/hand.types';
import { detectPinch } from '../utils/gestureRecognizer';
import { getHighlightedWindowId } from '../utils/windowManager';

interface Props {
  hands: Hand[];
  fps: number;
}

export function DebugPanel({ hands, fps }: Props) {
  const highlightedWindowId = getHighlightedWindowId();
  
  return (
    <div className="bg-black/80 text-white p-3 text-xs font-mono">
      <div>FPS: {fps}</div>
      <div>Hands: {hands.length}</div>
      {highlightedWindowId && (
        <div className="mt-2 text-yellow-400">
          Window: {highlightedWindowId}
        </div>
      )}
      {hands.map((hand, idx) => {
        const pinch = detectPinch(hand);
        const handLabel = idx === 0 ? 'Left' : 'Right';
        
        return (
          <div key={idx} className="mt-2">
            <div>
              {handLabel} Hand: {(hand.confidence * 100).toFixed(1)}%
            </div>
            <div className="flex gap-2 mt-1">
              {['👍', '☝️', '🖕', '💍', '🤙'].map((emoji, i) => (
                <span key={i} className={hand.fingersExtended[i] ? 'opacity-100' : 'opacity-30'}>
                  {emoji}
                </span>
              ))}
            </div>
            {pinch.isPinching && (
              <div className="mt-1 text-red-400">
                Pinch: {pinch.distance.toFixed(0)}px
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

