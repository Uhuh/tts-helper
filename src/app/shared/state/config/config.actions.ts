import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  AmazonPollyData,
  AuthTokens,
  ChatPermissions,
  ConfigState,
  GeneralChatState,
  GptChatState,
  GptPersonalityState, GptSettingsState, StreamElementsData,
  TtsType
} from './config.feature';

export const GlobalConfigActions = createActionGroup({
  source: 'GlobalConfig',
  events: {
    'Update State': props<{ configState: ConfigState }>(),
    'Update Tokens': props<{ tokens: Partial<AuthTokens> }>(),
    'Update GPT Personality': props<{ gptPersonality: Partial<GptPersonalityState> }>(),
    'Update GPT Settings': props<{ gptSettings: Partial<GptSettingsState> }>(),
    'Update GPT Chat': props<{ gptChat: Partial<GptChatState> }>(),
    'Update GPT Chat Permissions': props<{ permissions: Partial<ChatPermissions> }>(),
    'Update General Chat': props<{ generalChat: Partial<GeneralChatState> }>(),
    'Update General Chat Permissions': props<{ permissions: Partial<ChatPermissions> }>(),
    'Update Selected Tts': props<{ tts: TtsType }>(),
    'Update Selected Tts Url': props<{ url: string }>(),
    'Update Selected Audio Device': props<{ audioDevice: number }>(),
    'Update Device Volume': props<{ deviceVolume: number }>(),
    'Update Banned Words': props<{ bannedWords: string[] }>(),
    'Update Amazon Polly': props<{ amazonPolly: Partial<AmazonPollyData> }>(),
    'Update Stream Elements': props<{ streamElements: Partial<StreamElementsData> }>(),
    'Update Tik Tok Voice': props<{ voice: string }>(),
    'Update Tik Tok Language': props<{ language: string }>(),
    'Update Tts Monster Overlay': props<{ overlay: string; key: string; userId: string }>(),
    'Reset State': emptyProps(),
  }
});