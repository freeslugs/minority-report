# HandWave - Gesture-Controlled Browser Navigation

A Chrome extension that enables hands-free browser control using real-time hand tracking via webcam. Navigate, scroll, switch tabs, and manipulate windows using intuitive hand gestures.

## Features (Phase 1)

- ✅ Real-time hand detection using TensorFlow.js HandPose
- ✅ Draggable camera overlay with debug visualization
- ✅ 21 landmarks per hand tracked accurately
- ✅ Finger state detection (extended/curled)
- ✅ FPS monitoring and performance optimization
- ✅ Onboarding flow for first-time users
- ✅ Camera permission management

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Chrome browser for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd minority-report
```

2. Install dependencies:
```bash
npm install
```

3. Generate icons (optional):
```bash
# Install Pillow if needed: pip install Pillow
python3 generateIcons.py path/to/your/icon128.png
```

Or create icon files manually:
- `public/icons/icon16.png` (16x16)
- `public/icons/icon48.png` (48x48)
- `public/icons/icon128.png` (128x128)

### Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

### Loading in Chrome

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Project Structure

```
handwave-extension/
├── src/
│   ├── background/       # Service worker
│   ├── content/          # Content script (injects overlay)
│   ├── overlay/          # Camera overlay components
│   ├── popup/            # Extension popup UI
│   ├── hooks/            # React hooks
│   ├── utils/            # Utilities (hand detection, rendering)
│   ├── types/            # TypeScript type definitions
│   └── shared/           # Shared constants
├── public/
│   └── icons/            # Extension icons
└── manifest.json         # Chrome extension manifest
```

## Technology Stack

- **React 18+** with TypeScript
- **Vite** for fast builds and HMR
- **TensorFlow.js** with HandPose model
- **Tailwind CSS** for styling

## Usage

1. Click the extension icon to open the popup
2. Complete the onboarding flow (first time only)
3. Grant camera permissions when prompted
4. Toggle "Enable Extension" to start hand tracking
5. The camera overlay will appear on the current page
6. Place your hands in front of the camera to see detection

## Future Features (Phase 2)

- Gesture controls (scrolling, clicking, tab switching)
- Custom gesture training
- Gesture customization UI
- Multi-monitor support

## License

MIT

