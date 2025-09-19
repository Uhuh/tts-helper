import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { GlobalConfigActions } from './config.actions';
import { ChatPermissions, ChatState } from '../../services/chat.interface';
import { VoiceId } from '@aws-sdk/client-polly';
import { uuidv4 } from 'uuidv7';
import { klona } from 'klona';

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

export type GeneralChatState = ChatState;

export type AuthTokens = {
  vtsAuthToken: string;
};

/**
 * Allows streamers to setup block or allow list.
 */
export interface UserListState {
  shouldBlockUser: boolean;
  usernames: string[];
}

export interface CustomUserVoice {
  id: string;
  username: string;
  ttsType: TtsType;
  voice: string;
  language: string;
}

export type MultiVoice = {
  id: string;
  // This voice ID associated with what APIs care about.
  voice: string;
  language: string;
  // How users will use the voice. (brian): vs (brain-english-us-1234):
  customName: string;
  ttsType: TtsType;
};

export interface ConfigState {
  tts: TtsType;
  url: string;
  authTokens: AuthTokens;
  audioDevice: number;
  deviceVolume: number;
  // The delay in SECONDS. This will be converted to milliseconds when sent to rust.
  audioDelay: number;
  generalChat: GeneralChatState;
  streamElements: StreamElementsData;
  ttsMonster: TtsMonsterData;
  amazonPolly: AmazonPollyData;
  tikTok: TikTokData;
  bannedWords: string[];
  filteredWords: string[];
  userListState: UserListState;
  customUserVoices: CustomUserVoice[];
  customUserVoiceRedeem: string;
  multiVoices: MultiVoice[];
  chaosMode: boolean;
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
  filteredWords: [],
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
  userListState: {
    shouldBlockUser: true,
    // Common bot names
    usernames: ['streamelements', 'botrix', 'nightbot'],
  },
  customUserVoices: [],
  customUserVoiceRedeem: '',
  multiVoices: [],
  chaosMode: false,
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
    on(GlobalConfigActions.updateFilteredWords, (state, { filteredWords }) => ({
      ...state,
      filteredWords,
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
    on(GlobalConfigActions.updateUserList, (state, { userListState }) => ({
      ...state,
      userListState: {
        ...state.userListState,
        ...userListState,
      },
    })),
    on(GlobalConfigActions.createCustomUserVoice, (state, { partialSettings }) => ({
      ...state,
      customUserVoices: [
        ...state.customUserVoices,
        {
          id: uuidv4(),
          language: 'English (US)',
          voice: 'en-US-Standard-E',
          ttsType: 'stream-elements',
          username: '<not set>',
          ...partialSettings,
        } satisfies CustomUserVoice,
      ],
    })),
    on(GlobalConfigActions.updateCustomUserVoice, (state, { id, partialSettings }) => {
      const customerUserVoice = state.customUserVoices.find(c => c.id === id);

      if (!customerUserVoice) {
        return state;
      }

      const copiedCustomerUserVoices = klona(state.customUserVoices);
      const index = state.customUserVoices.indexOf(customerUserVoice);

      copiedCustomerUserVoices[index] = {
        ...customerUserVoice,
        ...partialSettings,
      };

      return {
        ...state,
        customUserVoices: copiedCustomerUserVoices,
      };
    }),
    on(GlobalConfigActions.deleteCustomUserVoice, (state, { id }) => {
      const customerUserVoice = state.customUserVoices.find(c => c.id === id);

      if (!customerUserVoice) {
        return state;
      }

      const copiedCustomerUserVoices = klona(state.customUserVoices);
      const index = state.customUserVoices.indexOf(customerUserVoice);

      copiedCustomerUserVoices.splice(index, 1);

      return {
        ...state,
        customUserVoices: copiedCustomerUserVoices,
      };
    }),
    on(GlobalConfigActions.updateCustomUserVoiceRedeem, (state, { redeem }) => ({
      ...state,
      customUserVoiceRedeem: redeem,
    })),
    on(GlobalConfigActions.createMultiVoice, (state, { partialSettings }) => ({
      ...state,
      multiVoices: [
        ...state.multiVoices,
        {
          id: uuidv4(),
          language: 'English (US)',
          voice: 'en-US-Standard-E',
          ttsType: 'stream-elements',
          customName: '<not set>',
          ...partialSettings,
        } satisfies MultiVoice,
      ],
    })),
    on(GlobalConfigActions.updateMultiVoice, (state, { id, partialSettings }) => {
      const multiVoice = state.multiVoices.find(c => c.id === id);

      if (!multiVoice) {
        return state;
      }

      const copiedMultiVoices = klona(state.multiVoices);
      const index = state.multiVoices.indexOf(multiVoice);

      copiedMultiVoices[index] = {
        ...multiVoice,
        ...partialSettings,
      };

      return {
        ...state,
        multiVoices: copiedMultiVoices,
      };
    }),
    on(GlobalConfigActions.deleteMultiVoice, (state, { id }) => {
      const multiVoice = state.multiVoices.find(c => c.id === id);

      console.log(multiVoice, id);

      if (!multiVoice) {
        return state;
      }

      const copiedMultiVoices = klona(state.multiVoices);
      const index = state.multiVoices.indexOf(multiVoice);

      copiedMultiVoices.splice(index, 1);

      return {
        ...state,
        multiVoices: copiedMultiVoices,
      };
    }),
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
