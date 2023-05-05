import { createReducer, on } from '@ngrx/store';
import { ConfigState } from './config.model';
import {
  updateTtsMonsterOverlayInfo,
  streamElementsInfo,
  amazonPollyInfo,
  configInfo,
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
  on(configInfo.configState, (state, { configState }) => ({
    ...state,
    ...configState,
  })),
  on(configInfo.bannedWords, (state, { bannedWords }) => ({
    ...state,
    bannedWords,
  })),
  on(streamElementsInfo.language, (state, { language }) => ({
    ...state,
    streamElements: {
      ...state.streamElements,
      language,
    },
  })),
  on(streamElementsInfo.voice, (state, { voice }) => ({
    ...state,
    streamElements: {
      ...state.streamElements,
      voice,
    },
  })),
  on(amazonPollyInfo.poolId, (state, { poolId }) => ({
    ...state,
    amazonPolly: {
      ...state.amazonPolly,
      poolId,
    },
  })),
  on(amazonPollyInfo.region, (state, { region }) => ({
    ...state,
    amazonPolly: {
      ...state.amazonPolly,
      region,
    },
  })),
  on(amazonPollyInfo.language, (state, { language }) => ({
    ...state,
    amazonPolly: {
      ...state.amazonPolly,
      language,
    },
  })),
  on(amazonPollyInfo.voice, (state, { voice }) => ({
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
  on(configInfo.url, (state, { url }) => ({
    ...state,
    url,
  })),
  on(configInfo.tts, (state, { tts }) => ({
    ...state,
    tts,
  }))
);
