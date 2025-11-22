import { Hand } from '../types/hand.types';

interface Props {
  hands: Hand[];
  fps: number;
}

export function DebugPanel({ hands, fps }: Props) {
  return (
    <div className="bg-black/80 text-white p-3 text-xs font-mono">
      <div>FPS: {fps}</div>
      <div>Hands: {hands.length}</div>
      {hands.map((hand, idx) => (
        <div key={idx} className="mt-2">
          <div>Hand {idx + 1}: {(hand.confidence * 100).toFixed(1)}%</div>
          <div className="flex gap-2 mt-1">
            {['👍', '☝️', '🖕', '💍', '🤙'].map((emoji, i) => (
              <span key={i} className={hand.fingersExtended[i] ? 'opacity-100' : 'opacity-30'}>
                {emoji}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

