import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  AmazonPollyData,
  AuthTokens,
  ConfigState,
  CustomUserVoice,
  GeneralChatState,
  MultiVoice,
  StreamElementsData,
  TtsType,
  UserListState,
} from './config.feature';
import { ChatPermissions } from '../../services/chat.interface';

export const GlobalConfigActions = createActionGroup({
  source: 'GlobalConfig',
  events: {
    'Update State': props<{ configState: Partial<ConfigState> }>(),
    'Update Tokens': props<{ tokens: Partial<AuthTokens> }>(),
    'Update GPT Chat Permissions': props<{ permissions: Partial<ChatPermissions> }>(),
    'Update General Chat': props<{ generalChat: Partial<GeneralChatState> }>(),
    'Update General Chat Permissions': props<{ permissions: Partial<ChatPermissions> }>(),
    'Update Selected Tts': props<{ tts: TtsType }>(),
    'Update Selected Tts Url': props<{ url: string }>(),
    'Update Selected Audio Device': props<{ audioDevice: number }>(),
    'Update Device Volume': props<{ deviceVolume: number }>(),
    'Update Audio Delay': props<{ audioDelay: number }>(),
    'Update Banned Words': props<{ bannedWords: string[] }>(),
    'Update Amazon Polly': props<{ amazonPolly: Partial<AmazonPollyData> }>(),
    'Update Stream Elements': props<{ streamElements: Partial<StreamElementsData> }>(),
    'Update Tik Tok Voice': props<{ voice: string }>(),
    'Update Tik Tok Language': props<{ language: string }>(),
    'Update Tts Monster Overlay': props<{ overlay: string; key: string; userId: string }>(),
    'Update User List': props<{ userListState: UserListState }>(),
    'Create Custom User Voice': props<{ partialSettings?: Partial<CustomUserVoice> }>(),
    'Update Custom User Voice': props<{ id: string, partialSettings: Partial<CustomUserVoice> }>(),
    'Delete Custom User Voice': props<{ id: string }>(),
    'Update Custom User Voice Redeem': props<{ redeem: string }>(),
    'Create Multi Voice': props<{ partialSettings?: Partial<MultiVoice> }>(),
    'Update Multi Voice': props<{ id: string, partialSettings: Partial<MultiVoice> }>(),
    'Delete Multi Voice': props<{ id: string }>(),
    'Reset State': emptyProps(),
  },
});