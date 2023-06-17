import { createAction, createActionGroup, props } from '@ngrx/store';
import { TtsType } from './config.interface';
import { ConfigState } from './config.model';

export const configInfo = createActionGroup({
  source: 'ConfigState',
  events: {
    Tts: props<{ tts: TtsType }>(),
    Url: props<{ url: string }>(),
    'Audio Device': props<{ audioDevice: string }>(),
    'Device Volume': props<{ deviceVolume: number }>(),
    'Banned Words': props<{ bannedWords: string[] }>(),
    'Config State': props<{ configState: ConfigState }>(),
  },
});

export const amazonPollyInfo = createActionGroup({
  source: 'ConfigState - AmazonPolly Settings',
  events: {
    Voice: props<{ voice: string }>(),
    Region: props<{ region: string }>(),
    Enabled: props<{ enabled: boolean }>(),
    Language: props<{ language: string }>(),
    'Pool Id': props<{ poolId: string }>(),
  },
});

export const streamElementsInfo = createActionGroup({
  source: 'StreamElements',
  events: {
    Voice: props<{ voice: string }>(),
    Language: props<{ language: string }>(),
  },
});

export const tikTokInfo = createActionGroup({
  source: 'TikTok',
  events: {
    Voice: props<{ voice: string }>(),
    Language: props<{ language: string }>(),
  },
});

export const updateTtsMonsterOverlayInfo = createAction(
  '[ ConfigState ] Updating tts monster overlay info',
  props<{ overlay: string; key: string; userId: string }>()
);
