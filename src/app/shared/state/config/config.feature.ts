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

export interface ConfigState {
  tts: TtsType;
  url: string;
  audioDevice: number;
  deviceVolume: number;
  streamElements: StreamElementsData;
  ttsMonster: TtsMonsterData;
  amazonPolly: AmazonPollyData;
  tikTok: TikTokData;
  bannedWords: string[];
}

export const initialState: ConfigState = {
  bannedWords: [],
  tts: 'stream-elements',
  url: 'https://api.streamelements.com/kappa/v2/speech',
  audioDevice: 0,
  deviceVolume: 100,
  streamElements: {
    language: '',
    voice: '',
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
    voice: '',
    language: '',
    poolId: '',
    region: '',
  },
  tikTok: {
    voice: '',
    language: '',
  },
};

export const configFeature = createFeature({
  name: 'GlobalConfig',
  reducer: createReducer(
    initialState,
    on(GlobalConfigActions.updateState, (state, { configState }) => ({
      ...state,
      ...configState,
    })),
    on(GlobalConfigActions.updateBannedWords, (state, { bannedWords }) => ({
      ...state,
      bannedWords,
    })),
    on(GlobalConfigActions.updateStreamElementsLanguage, (state, { language }) => ({
      ...state,
      streamElements: {
        ...state.streamElements,
        language,
      },
    })),
    on(GlobalConfigActions.updateStreamElementsVoice, (state, { voice }) => ({
      ...state,
      streamElements: {
        ...state.streamElements,
        voice,
      },
    })),
    on(GlobalConfigActions.updateAmazonPollyPoolId, (state, { poolId }) => ({
      ...state,
      amazonPolly: {
        ...state.amazonPolly,
        poolId,
      },
    })),
    on(GlobalConfigActions.updateAmazonPollyRegion, (state, { region }) => ({
      ...state,
      amazonPolly: {
        ...state.amazonPolly,
        region,
      },
    })),
    on(GlobalConfigActions.updateAmazonPollyLanguage, (state, { language }) => ({
      ...state,
      amazonPolly: {
        ...state.amazonPolly,
        language,
      },
    })),
    on(GlobalConfigActions.updateAmazonPollyVoice, (state, { voice }) => ({
      ...state,
      amazonPolly: {
        ...state.amazonPolly,
        voice,
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
  }) => ({
    selectBannedWordsLength: createSelector(
      selectBannedWords,
      (bannedWords) => bannedWords.length,
    ),
  }),
});
