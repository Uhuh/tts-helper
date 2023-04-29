import { createAction, props } from '@ngrx/store';
import { TtsType } from './config.interface';
import { ConfigState } from './config.model';

export const updateConfigState = createAction(
  '[ ConfigState ] Updating config state',
  props<{ configState: ConfigState }>()
);

export const updateBannedWords = createAction(
  '[ ConfigState ] Updating banned words',
  props<{ bannedWords: string[] }>()
);

export const updateTts = createAction(
  '[ ConfigState ] Updating tts',
  props<{ tts: TtsType }>()
);

export const updateUrl = createAction(
  '[ ConfigState ] Updating url',
  props<{ url: string }>()
);

export const updateAmazonPollyRegion = createAction(
  '[ ConfigState ] Updating amazon polly region',
  props<{ region: string }>(),
);

export const updateAmazonPollyPoolId = createAction(
  '[ ConfigState ] Updating amazon polly pool ID',
  props<{ poolId: string }>(),
);

export const updateAmazonPollyLanguage= createAction(
  '[ ConfigState ] Updating amazon polly language',
  props<{ language: string }>(),
);

export const updateAmazonPollyVoice = createAction(
  '[ ConfigState ] Updating amazon polly voice',
  props<{ voice: string }>(),
);

export const updateTtsMonsterOverlayInfo = createAction(
  '[ ConfigState ] Updating tts monster overlay info',
  props<{ overlay: string; key: string; userId: string }>()
);

export const updateStreamElementsLanguage = createAction(
  '[ ConfigState ] Updating stream elements voice language',
  props<{ language: string }>()
);

export const updateVoice = createAction(
  '[ ConfigState ] Updating voice',
  props<{ voice: string }>()
);
