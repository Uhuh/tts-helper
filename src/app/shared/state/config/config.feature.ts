import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { GlobalConfigActions } from './config.actions';

export type TtsType =
  | 'stream-elements'
  | 'tts-monster'
  | 'amazon-polly'
  | 'windows'
  | 'tiktok';

export interface StreamElementsData {
  voice: string;
  language: string;
}

export interface AmazonPollyData {
  region: string;
  poolId: string;
  language: string;
  voice: string;
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

export interface ChatPermissions {
  allUsers: boolean,
  mods: boolean,
  payingMembers: boolean,
}

export interface ChatState {
  enabled: boolean;
  permissions: ChatPermissions;
  cooldown: number;
  charLimit: number;
  command: string;
}

export interface GeneralChatState extends ChatState {
}

export interface GptChatState extends ChatState {
}

export interface GptPersonalityState {
  streamersIdentity: string;
  streamerModelRelation: string;
  streamersThoughtsOnModel: string;
  modelsIdentity: string;
  modelsCoreIdentity: string;
  modelsBackground: string;
}

export interface GptSettingsState {
  apiToken: string;
  enabled: boolean;
  historyLimit: number;
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
  generalChat: GeneralChatState;
  gptChat: GptChatState;
  gptPersonality: GptPersonalityState;
  gptSettings: GptSettingsState;
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

export const initialState: ConfigState = {
  bannedWords: [],
  tts: 'stream-elements',
  url: 'https://api.streamelements.com/kappa/v2/speech',
  audioDevice: 0,
  deviceVolume: 100,
  authTokens: {
    vtsAuthToken: '',
  },
  generalChat: defaultChatState,
  gptChat: {
    ...defaultChatState,
    command: '!ask',
    charLimit: 999,
  },
  gptPersonality: {
    modelsBackground: '',
    modelsCoreIdentity: '',
    streamersThoughtsOnModel: '',
    modelsIdentity: '',
    streamerModelRelation: '',
    streamersIdentity: '',
  },
  gptSettings: {
    apiToken: '',
    enabled: false,
    historyLimit: 10,
  },
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
  },
  streamElements: defaultTtsState,
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
    on(GlobalConfigActions.updateGPTPersonality, (state, { gptPersonality }) => ({
      ...state,
      gptPersonality: {
        ...state.gptPersonality,
        ...gptPersonality,
      },
    })),
    on(GlobalConfigActions.updateGPTSettings, (state, { gptSettings }) => ({
      ...state,
      gptSettings: {
        ...state.gptSettings,
        ...gptSettings,
      },
    })),
    on(GlobalConfigActions.updateGPTChat, (state, { gptChat }) => ({
      ...state,
      gptChat: {
        ...state.gptChat,
        ...gptChat,
      },
    })),
    on(GlobalConfigActions.updateGPTChatPermissions, (state, { permissions }) => ({
      ...state,
      gptChat: {
        ...state.gptChat,
        permissions: {
          ...state.gptChat.permissions,
          ...permissions,
        },
      },
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
  ),
  extraSelectors: ({
    selectBannedWords,
    selectGptSettings,
  }) => ({
    selectBannedWordsLength: createSelector(
      selectBannedWords,
      (bannedWords) => bannedWords.length,
    ),
    selectGptToken: createSelector(
      selectGptSettings,
      (gptSettings) => gptSettings.apiToken,
    ),
    selectGptEnabled: createSelector(
      selectGptSettings,
      (gptSettings) => gptSettings.enabled,
    ),
  }),
});
