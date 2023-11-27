export enum StreamDeckActions {
  STT = 'com.tts-helper.tts-helper.stt',
  TOGGLE_QUEUE = 'com.tts-helper.tts-helper.toggle-queue',
  REFRESH = 'com.tts-helper.tts-helper.refresh',
  SKIP = 'com.tts-helper.tts-helper.skip',
}

export interface StreamDeckEvent {
  action: string;
  event: string;
  data: string;
}