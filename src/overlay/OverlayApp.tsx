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
  
  // Show loading state while initializing
  if (!stream && !error) {
    return (
      <div 
        ref={overlayRef}
        className="fixed z-[9999] rounded-lg shadow-2xl border-2 border-blue-500 bg-white p-6"
        style={{ left: position.x, top: position.y }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing camera...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed z-[9999] bg-red-50 border-2 border-red-300 rounded-lg p-6 shadow-lg max-w-md" style={{ left: position.x, top: position.y }}>
        <h3 className="text-lg font-bold text-red-800 mb-2">Camera Access Required</h3>
        <p className="text-red-700 mb-4">
          {error.includes('denied') || error.includes('permission') 
            ? "Camera access was denied. Please click the camera icon in your browser's address bar and allow camera access, then refresh this page."
            : `Camera Error: ${error}`}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Reload Page
        </button>
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

