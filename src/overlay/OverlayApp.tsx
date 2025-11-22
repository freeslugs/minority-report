import { useRef, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useHandDetection } from '../hooks/useHandDetection';
import { useDraggable } from '../hooks/useDraggable';
import { useExtensionState } from '../hooks/useExtensionState';
import { initModel } from '../utils/handDetection';
import { CameraView } from './CameraView';
import { DebugPanel } from './DebugPanel';

export function OverlayApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const { stream, error, requestCamera } = useCamera();
  const { hands, fps, setIsRunning } = useHandDetection(videoRef);
  const { position } = useDraggable(overlayRef);
  const { debugMode } = useExtensionState();
  
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        await initModel();
        if (mounted) {
          await requestCamera();
          setIsRunning(true);
        }
      } catch (err) {
        console.error('Failed to initialize overlay:', err);
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
    };
  }, [requestCamera, setIsRunning]);
  
  if (error) {
    return (
      <div className="fixed z-[9999] bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg" style={{ left: position.x, top: position.y }}>
        <p className="text-red-700">Camera Error: {error}</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={overlayRef}
      className="fixed z-[9999] rounded-lg shadow-2xl border-2 border-blue-500 bg-white cursor-move"
      style={{ left: position.x, top: position.y }}
    >
      <CameraView 
        videoRef={videoRef}
        canvasRef={canvasRef}
        stream={stream}
        hands={hands}
        debugMode={debugMode}
      />
      {debugMode && <DebugPanel hands={hands} fps={fps} />}
    </div>
  );
}

