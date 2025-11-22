import { useState, useEffect } from 'react';
import { Hand } from '../types/hand.types';
import { detectPinch } from '../utils/gestureRecognizer';
import { getHighlightedWindowId, getHighlightedWindowInfo } from '../utils/windowManager';

interface Props {
  hands: Hand[];
  fps: number;
}

export function DebugPanel({ hands, fps }: Props) {
  const highlightedWindowId = getHighlightedWindowId();
  const windowInfo = getHighlightedWindowInfo();
  const [pinchState, setPinchState] = useState<{ [key: number]: { isPinching: boolean; isReady: boolean; distance: number } }>({});
  
  // Update pinch state for all hands
  useEffect(() => {
    const newPinchState: { [key: number]: { isPinching: boolean; isReady: boolean; distance: number } } = {};
    hands.forEach((hand, idx) => {
      newPinchState[idx] = detectPinch(hand);
    });
    setPinchState(newPinchState);
  }, [hands]);
  
  const getWindowDisplay = () => {
    if (!highlightedWindowId) return null;
    
    if (windowInfo?.title) {
      const shortUrl = windowInfo.url ? new URL(windowInfo.url).hostname : '';
      return (
        <div className="mt-2 p-2 bg-yellow-900/50 rounded border border-yellow-500">
          <div className="text-yellow-300 font-semibold">📍 Selected Window</div>
          <div className="text-yellow-200 text-xs mt-1 truncate" title={windowInfo.title}>
            {windowInfo.title}
          </div>
          {shortUrl && (
            <div className="text-yellow-400/70 text-xs mt-1 truncate" title={windowInfo.url}>
              {shortUrl}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="mt-2 text-yellow-400">
        Window ID: {highlightedWindowId}
      </div>
    );
  };
  
  return (
    <div className="bg-black/90 text-white p-3 text-xs font-mono">
      <div className="mb-2 pb-2 border-b border-gray-700">
        <div>FPS: {fps}</div>
        <div>Hands: {hands.length}</div>
      </div>
      
      {getWindowDisplay()}
      
      {highlightedWindowId && (
        <div className="mt-2 p-2 bg-blue-900/50 rounded border border-blue-500">
          <div className="text-blue-300 font-semibold mb-1">✋ Gesture Instructions</div>
          <div className="text-blue-200 text-xs">
            <div>• <strong>Pinch</strong> (thumb + index together) to minimize</div>
            <div>• <strong>Swipe up/down</strong> to scroll page</div>
          </div>
        </div>
      )}
      
      {hands.map((hand, idx) => {
        const pinch = pinchState[idx] || { isPinching: false, isReady: false, distance: 999 };
        const handLabel = idx === 0 ? 'Left' : 'Right';
        const handColor = idx === 0 ? 'text-blue-300' : 'text-red-300';
        
        return (
          <div key={idx} className="mt-3 p-2 bg-gray-900/50 rounded">
            <div className={`${handColor} font-semibold`}>
              {handLabel} Hand: {(hand.confidence * 100).toFixed(1)}%
            </div>
            <div className="flex gap-2 mt-1">
              {['👍', '☝️', '🖕', '💍', '🤙'].map((emoji, i) => (
                <span key={i} className={hand.fingersExtended[i] ? 'opacity-100' : 'opacity-30'}>
                  {emoji}
                </span>
              ))}
            </div>
            
            {/* Pinch feedback */}
            {pinch.isReady && !pinch.isPinching && (
              <div className="mt-2 p-1 bg-yellow-900/50 rounded border border-yellow-500">
                <div className="text-yellow-300 text-xs">
                  🟡 Ready to pinch: {pinch.distance.toFixed(0)}px
                </div>
                <div className="text-yellow-400/70 text-xs mt-1">
                  Bring thumb and index closer together
                </div>
              </div>
            )}
            
            {pinch.isPinching && (
              <div className="mt-2 p-1 bg-red-900/50 rounded border-2 border-red-500">
                <div className="text-red-300 font-bold text-xs">
                  🔴 PINCHING! {pinch.distance.toFixed(0)}px
                </div>
                <div className="text-red-400/70 text-xs mt-1">
                  Window will minimize...
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

