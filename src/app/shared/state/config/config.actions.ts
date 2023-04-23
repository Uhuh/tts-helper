import { createAction, props } from '@ngrx/store';
import { TtsType, VoiceSettings } from './config.interface';
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

export const updateLanguage = createAction(
  '[ ConfigState ] Updating voice language',
  props<{ language: string }>()
);

export const updateVoice = createAction(
  '[ ConfigState ] Updating voice',
  props<{ voice: string }>()
);

export const updateTts = createAction(
  '[ ConfigState ] Updating tts',
  props<{ tts: TtsType }>()
);

export const updateUrl = createAction(
  '[ ConfigState ] Updating url',
  props<{ url: string }>()
);
