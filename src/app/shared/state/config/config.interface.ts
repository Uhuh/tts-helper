export type TtsType = 'stream-elements' | 'tts-monster';

export const TtsUrlMap = {
  'stream-elements': 'https://api.streamelements.com/kappa/v2/speech',
  'tts-monster': '',
} as const;

export interface VoiceSettings {
  tts: TtsType;
  url: string;
  voice: string;
  language: string;
  voiceQueryParam: string;
}
