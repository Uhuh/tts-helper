export type TtsType =
  | 'stream-elements'
  | 'tts-monster'
  | 'amazon-polly'
  | 'windows'
  | 'tiktok';

export const TtsUrlMap = {
  'stream-elements': 'https://api.streamelements.com/kappa/v2/speech',
  tiktok: '',
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
  ai: boolean;
  details: {
    provider: 'tts-helper';
  };
}
