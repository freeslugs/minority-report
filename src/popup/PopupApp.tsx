import { useEffect } from 'react';
import { useExtensionState } from '../hooks/useExtensionState';
import { useCamera } from '../hooks/useCamera';
import { useOnboarding } from '../hooks/useOnboarding';
import { MessageType } from '../types/message.types';
import { OnboardingFlow } from './OnboardingFlow';
import { ToggleSwitch } from './ToggleSwitch';
import { CameraSelector } from './CameraSelector';

export function PopupApp() {
  const { enabled, debugMode, updateState } = useExtensionState();
  const { devices, enumerateDevices } = useCamera();
  const { showOnboarding, completeOnboarding, showOnboardingAgain } = useOnboarding();
  
  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);
  
  const toggleExtension = () => {
    const newState = !enabled;
    updateState('enabled', newState);
    
    chrome.runtime.sendMessage({
      type: newState ? MessageType.ENABLE_EXTENSION : MessageType.DISABLE_EXTENSION
    });
  };
  
  // Show onboarding if not completed
  if (showOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }
  
  return (
    <div className="w-[320px] p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">👋 HandWave</h1>
        <button
          onClick={showOnboardingAgain}
          className="text-xs text-gray-500 hover:text-gray-700"
          title="Show onboarding again"
        >
          ℹ️
        </button>
      </div>
      
      <ToggleSwitch 
        checked={enabled}
        onChange={toggleExtension}
        label="Enable Extension"
      />
      
      <CameraSelector 
        devices={devices}
        onChange={(deviceId) => updateState('cameraId', deviceId)}
      />
      
      <label className="flex items-center mt-4">
        <input
          type="checkbox"
          checked={debugMode}
          onChange={(e) => updateState('debugMode', e.target.checked)}
          className="mr-2"
        />
        <span className="text-sm text-gray-700">Debug Mode</span>
      </label>
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800">
        <p className="font-semibold mb-1">Gestures:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Point hand at window → highlights</li>
          <li>Pinch (thumb + index) → minimizes</li>
          <li>Swipe up/down → scrolls page</li>
        </ul>
      </div>
      
      <div className={`mt-4 p-2 rounded ${enabled ? 'bg-green-100' : 'bg-red-100'}`}>
        <span className={`text-sm ${enabled ? 'text-green-800' : 'text-red-800'}`}>
          Status: {enabled ? '✓ Active' : '○ Inactive'}
        </span>
      </div>
    </div>
  );
}

