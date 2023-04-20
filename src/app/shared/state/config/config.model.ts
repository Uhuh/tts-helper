import { VoiceSettings } from './config.interface';

export interface ConfigState {
  voiceSettings: VoiceSettings;
  bannedWords: string[];
}
