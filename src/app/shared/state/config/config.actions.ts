import { createAction, props } from '@ngrx/store';
import { VoiceSettings } from './config.interface';
import { ConfigState } from './config.model';

export const updateConfigState = createAction(
  '[ ConfigState ] Updating config state',
  props<{ configState: ConfigState }>()
);

export const updateVoiceSettings = createAction(
  '[ ConfigState ] Updating voice settings',
  props<{ voiceSettings: VoiceSettings }>()
);

export const updateBannedWords = createAction(
  '[ ConfigState ] Updating banned words',
  props<{ bannedWords: string[] }>()
);
