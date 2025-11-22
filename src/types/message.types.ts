export enum MessageType {
  ENABLE_EXTENSION = 'ENABLE_EXTENSION',
  DISABLE_EXTENSION = 'DISABLE_EXTENSION',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  HAND_DATA = 'HAND_DATA'
}

export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}

