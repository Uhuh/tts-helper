export type TtsType =
  | 'stream-elements'
  | 'tts-monster'
  | 'amazon-polly'
  | 'windows';

export const TtsUrlMap = {
  'stream-elements': 'https://api.streamelements.com/kappa/v2/speech',
  'tts-monster': '',
  'amazon-polly': '',
  windows: '',
} as const;

export interface StreamElementsData {
  voice: string;
  language: string;
}

export interface AmazonPollyData {
  region: string;
  poolId: string;
  language: string;
  voice: string;
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
