import { useEffect, useState } from 'react';

interface Props {
  devices: MediaDeviceInfo[];
  onChange: (deviceId: string) => void;
}

export function CameraSelector({ devices, onChange }: Props) {
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      // Load saved device preference
      chrome.storage.sync.get(['cameraId'], (result) => {
        const savedDeviceId = result.cameraId;
        if (savedDeviceId && devices.some(d => d.deviceId === savedDeviceId)) {
          setSelectedDevice(savedDeviceId);
          onChange(savedDeviceId);
        } else {
          setSelectedDevice(devices[0].deviceId);
          onChange(devices[0].deviceId);
        }
      });
    }
  }, [devices, selectedDevice, onChange]);

  if (devices.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Camera
      </label>
      <select
        value={selectedDevice}
        onChange={(e) => {
          setSelectedDevice(e.target.value);
          onChange(e.target.value);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
          </option>
        ))}
      </select>
    </div>
  );
}

