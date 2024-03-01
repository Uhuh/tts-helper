import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { GlobalConfigActions } from './config.actions';
import { ChatPermissions, ChatState } from '../../services/chat.interface';
import { VoiceId } from '@aws-sdk/client-polly';

export type TtsType =
  | 'stream-elements'
  | 'tts-monster'
  | 'amazon-polly'
  | 'windows'
  | 'eleven-labs'
  | 'tiktok';

export interface StreamElementsData {
  voice: string;
  language: string;
}

export interface AmazonPollyData {
  region: string;
  poolId: string;
  language: string;
  voice: VoiceId;
}

export interface TtsMonsterData {
  overlay: string;
  userId: string;
  key: string;
  ai: boolean;
  details: {
    provider: 'tts-helper';
  };
}

export interface TikTokData {
  voice: string;
  language: string;
}

/**
 * TODO Support multiple TTS redeems that can be configured to different services.
 */

export interface GeneralChatState extends ChatState {
}

export type AuthTokens = {
  vtsAuthToken: string;
};

export interface ConfigState {
  tts: TtsType;
  url: string;
  authTokens: AuthTokens;
  audioDevice: number;
  deviceVolume: number;
  // The delay in SECONDS. This will be converted to miliseconds when sent to rust.
  audioDelay: number;
  generalChat: GeneralChatState;
  streamElements: StreamElementsData;
  ttsMonster: TtsMonsterData;
  amazonPolly: AmazonPollyData;
  tikTok: TikTokData;
  bannedWords: string[];
}

const defaultChatPermissions: ChatPermissions = {
  allUsers: false,
  mods: false,
  payingMembers: false,
};

const defaultChatState: ChatState = {
  command: '!say',
  permissions: defaultChatPermissions,
  cooldown: 0,
  charLimit: 300,
  enabled: false,
};

const defaultTtsState = {
  language: '',
  voice: '',
};

const initialState: ConfigState = {
  bannedWords: [],
  tts: 'stream-elements',
  url: 'https://api.streamelements.com/kappa/v2/speech',
  audioDevice: 0,
  deviceVolume: 100,
  audioDelay: 1,
  authTokens: {
    vtsAuthToken: '',
  },
  generalChat: defaultChatState,
  ttsMonster: {
    overlay: '',
    userId: '',
    key: '',
    ai: false,
    details: {
      provider: 'tts-helper',
    },
  },
  amazonPolly: {
    ...defaultTtsState,
    poolId: '',
    region: '',
    voice: 'Amy',
  },
  // Set a default value for SE since it's the default TTS option.
  streamElements: {
    language: 'English (US)',
    voice: 'en-US-Standard-E',
  },
  tikTok: defaultTtsState,
};

export const ConfigFeature = createFeature({
  name: 'GlobalConfig',
  reducer: createReducer(
    initialState,
    on(GlobalConfigActions.updateTokens, (state, { tokens }) => ({
      ...state,
      authTokens: {
        ...state.authTokens,
        ...tokens,
      },
    })),
    on(GlobalConfigActions.updateState, (state, { configState }) => ({
      ...state,
      ...configState,
    })),
    on(GlobalConfigActions.updateGeneralChatPermissions, (state, { permissions }) => ({
      ...state,
      generalChat: {
        ...state.generalChat,
        permissions: {
          ...state.generalChat.permissions,
          ...permissions,
        },
      },
    })),
    on(GlobalConfigActions.updateGeneralChat, (state, { generalChat }) => ({
      ...state,
      generalChat: {
        ...state.generalChat,
        ...generalChat,
      },
    })),
    on(GlobalConfigActions.updateBannedWords, (state, { bannedWords }) => ({
      ...state,
      bannedWords,
    })),
    on(GlobalConfigActions.updateStreamElements, (state, { streamElements }) => ({
      ...state,
      streamElements: {
        ...state.streamElements,
        ...streamElements,
      },
    })),
    on(GlobalConfigActions.updateAmazonPolly, (state, { amazonPolly }) => ({
      ...state,
      amazonPolly: {
        ...state.amazonPolly,
        ...amazonPolly,
      },
    })),
    on(GlobalConfigActions.updateTikTokLanguage, (state, { language }) => ({
      ...state,
      tikTok: {
        ...state.tikTok,
        language,
      },
    })),
    on(GlobalConfigActions.updateTikTokVoice, (state, { voice }) => ({
      ...state,
      tikTok: {
        ...state.tikTok,
        voice,
      },
    })),
    on(GlobalConfigActions.updateTtsMonsterOverlay, (state, { overlay, key, userId }) => ({
      ...state,
      ttsMonster: {
        ...state.ttsMonster,
        overlay,
        key,
        userId,
      },
    })),
    on(GlobalConfigActions.updateSelectedTtsUrl, (state, { url }) => ({
      ...state,
      url,
    })),
    on(GlobalConfigActions.updateSelectedTts, (state, { tts }) => ({
      ...state,
      tts,
    })),
    on(GlobalConfigActions.updateSelectedAudioDevice, (state, { audioDevice }) => ({
      ...state,
      audioDevice,
    })),
    on(GlobalConfigActions.updateDeviceVolume, (state, { deviceVolume }) => ({
      ...state,
      deviceVolume,
    })),
    on(GlobalConfigActions.resetState, () => ({
      ...initialState,
    })),
    on(GlobalConfigActions.updateAudioDelay, (state, { audioDelay }) => ({
      ...state,
      audioDelay,
    })),
  ),
  extraSelectors: ({
    selectBannedWords,
    selectTts,
    selectStreamElements,
    selectTtsMonster,
    selectAmazonPolly,
    selectTikTok,
  }) => ({
    selectBannedWordsLength: createSelector(
      selectBannedWords,
      (bannedWords) => bannedWords.length,
    ),
    selectAudioSettings: createSelector(
      selectTts,
      selectBannedWords,
      selectStreamElements,
      selectTtsMonster,
      selectAmazonPolly,
      selectTikTok,
      (tts, bannedWords, streamElements, ttsMonster, amazonPolly, tikTok) => ({
        bannedWords, tts, streamElements, ttsMonster, amazonPolly, tikTok,
      }),
    ),
  }),
});
