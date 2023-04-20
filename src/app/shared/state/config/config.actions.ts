import { createAction, props } from '@ngrx/store';
import { VoiceSettings } from './config.interface';

export const updateVoiceSettings = createAction(
  '[ ConfigState ] Updating voice settings',
  props<{ voiceSettings: VoiceSettings }>()
);

export const updateBannedWords = createAction(
  '[ ConfigState ] Updating banned words',
  props<{ bannedWords: string[] }>()
);
