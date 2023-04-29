import {
  AmazonPollyData,
  StreamElementsData,
  TtsMonsterData,
  TtsType,
} from './config.interface';

export interface ConfigState {
  tts: TtsType;
  url: string;
  streamElements: StreamElementsData;
  ttsMonster: TtsMonsterData;
  amazonPolly: AmazonPollyData;
  bannedWords: string[];
}
