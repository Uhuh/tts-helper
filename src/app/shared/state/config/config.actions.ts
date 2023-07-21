import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ChatPermissions, ConfigState, GeneralChatState, GptChatState, TtsType } from './config.feature';

export const GlobalConfigActions = createActionGroup({
  source: 'GlobalConfig',
  events: {
    'Update State': props<{ configState: ConfigState }>(),
    'Update GPT Chat': props<{ chatState: GptChatState }>(),
    'Update GPT Chat Permissions': props<{ permissions: Partial<ChatPermissions> }>(),
    'Update General Chat': props<{ chatState: GeneralChatState }>(),
    'Update General Chat Permissions': props<{ permissions: Partial<ChatPermissions> }>(),
    'Update Selected Tts': props<{ tts: TtsType }>(),
    'Update Selected Tts Url': props<{ url: string }>(),
    'Update Selected Audio Device': props<{ audioDevice: number }>(),
    'Update Device Volume': props<{ deviceVolume: number }>(),
    'Update Banned Words': props<{ bannedWords: string[] }>(),
    'Update Amazon Polly Voice': props<{ voice: string }>(),
    'Update Amazon Polly Region': props<{ region: string }>(),
    'Update Amazon Polly Enabled': props<{ enabled: boolean }>(),
    'Update Amazon Polly Language': props<{ language: string }>(),
    'Update Amazon Polly Pool Id': props<{ poolId: string }>(),
    'Update Stream Elements Voice': props<{ voice: string }>(),
    'Update Stream Elements Language': props<{ language: string }>(),
    'Update Tik Tok Voice': props<{ voice: string }>(),
    'Update Tik Tok Language': props<{ language: string }>(),
    'Update Tts Monster Overlay': props<{ overlay: string; key: string; userId: string }>(),
    'Reset State': emptyProps(),
  }
});