import {
  AmazonPollyData,
  StreamElementsData,
  TikTokData,
  TtsMonsterData,
  TtsType,
} from './config.interface';

export interface ConfigState {
  tts: TtsType;
  url: string;
  audioDevice: string;
  deviceVolume: number;
  streamElements: StreamElementsData;
  ttsMonster: TtsMonsterData;
  amazonPolly: AmazonPollyData;
  tikTok: TikTokData;
  bannedWords: string[];
}
