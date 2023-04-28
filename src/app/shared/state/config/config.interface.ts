export type TtsType = 'stream-elements' | 'tts-monster';

export const TtsUrlMap = {
  'stream-elements': 'https://api.streamelements.com/kappa/v2/speech',
  'tts-monster': '',
} as const;

export interface VoiceSettings {
  tts: TtsType;
  url: string;
  streamElements: {
    voice: string;
    language: string;
  };
  ttsMonster: TtsMonsterData;
}

export interface TtsMonsterData {
  overlay: string;
  userId: string;
  key: string;
  message: string;
  ai: boolean;
  details: {
    provider: 'tts-helper';
  };
}
