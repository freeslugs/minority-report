export enum MessageType {
  ENABLE_EXTENSION = 'ENABLE_EXTENSION',
  DISABLE_EXTENSION = 'DISABLE_EXTENSION',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  HAND_DATA = 'HAND_DATA',
  GESTURE_DETECTED = 'GESTURE_DETECTED',
  SCROLL_PAGE = 'SCROLL_PAGE',
  HIGHLIGHT_WINDOW = 'HIGHLIGHT_WINDOW',
  MINIMIZE_WINDOW = 'MINIMIZE_WINDOW'
}

export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}

export interface GestureEvent {
  gesture: 'pinch' | 'swipe_up' | 'swipe_down' | 'window_select';
  handIndex: number;
  data?: any;
}

