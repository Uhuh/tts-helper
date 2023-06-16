import { createReducer, on } from '@ngrx/store';
import { ConfigState } from './config.model';
import {
  updateTtsMonsterOverlayInfo,
  streamElementsInfo,
  amazonPollyInfo,
  configInfo,
  tikTokInfo,
} from './config.actions';

export const initialState: ConfigState = {
  bannedWords: [],
  tts: 'stream-elements',
  url: 'https://api.streamelements.com/kappa/v2/speech',
  audioDevice: '',
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
  on(tikTokInfo.language, (state, { language }) => ({
    ...state,
    tikTok: {
      ...state.tikTok,
      language,
    },
  })),
  on(tikTokInfo.voice, (state, { voice }) => ({
    ...state,
    tikTok: {
      ...state.tikTok,
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
  })),
  on(configInfo.audioDevice, (state, { audioDevice }) => ({
    ...state,
    audioDevice,
  })),
  on(configInfo.deviceVolume, (state, { deviceVolume }) => ({
    ...state,
    deviceVolume,
  }))
);
