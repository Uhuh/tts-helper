import { createReducer, on } from '@ngrx/store';
import { ConfigState } from './config.model';
import {
  updateAmazonPollyLanguage,
  updateAmazonPollyPoolId,
  updateAmazonPollyRegion,
  updateAmazonPollyVoice,
  updateBannedWords,
  updateConfigState, updateStreamElementsLanguage,
  updateTts,
  updateTtsMonsterOverlayInfo,
  updateUrl,
  updateVoice,
} from './config.actions';

const initialState: ConfigState = {
  tts: 'stream-elements',
  url: 'https://api.streamelements.com/kappa/v2/speech',
  streamElements: {
    voice: '',
    language: '',
  },
  ttsMonster: {
    overlay: '',
    userId: '',
    key: '',
    message: '',
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
  bannedWords: [],
};

export const configReducer = createReducer(
  initialState,
  on(updateConfigState, (state, { configState }) => ({
    ...state,
    ...configState,
  })),
  on(updateBannedWords, (state, { bannedWords }) => ({
    ...state,
    bannedWords,
  })),
  on(updateStreamElementsLanguage, (state, { language }) => ({
    ...state,
    streamElements: {
      ...state.streamElements,
      language,
    },
  })),
  on(updateVoice, (state, { voice }) => ({
    ...state,
    streamElements: {
      ...state.streamElements,
      voice,
    },
  })),
  on(updateAmazonPollyPoolId, (state, { poolId }) => ({
    ...state,
    amazonPolly: {
      ...state.amazonPolly,
      poolId,
    },
  })),
  on(updateAmazonPollyRegion, (state, { region }) => ({
    ...state,
    amazonPolly: {
      ...state.amazonPolly,
      region,
    },
  })),
  on(updateAmazonPollyLanguage, (state, { language }) => ({
    ...state,
    amazonPolly: {
      ...state.amazonPolly,
      language,
    },
  })),
  on(updateAmazonPollyVoice, (state, { voice }) => ({
    ...state,
    amazonPolly: {
      ...state.amazonPolly,
      voice,
    },
  })),
  on(updateTtsMonsterOverlayInfo, (state, { overlay, key, userId }) => ({
    ...state,
    ttsMonster: {
      ...state.ttsMonster,
      overlay,
      key,
      userId,
    },
  })),
  on(updateUrl, (state, { url }) => ({
    ...state,
    url,
  })),
  on(updateTts, (state, { tts }) => ({
    ...state,
    tts,
  }))
);
