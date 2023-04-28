import { createReducer, on } from '@ngrx/store';
import { ConfigState } from './config.model';
import {
  updateBannedWords,
  updateConfigState,
  updateLanguage,
  updateTts,
  updateTtsMonsterAi,
  updateTtsMonsterOverlayInfo,
  updateUrl,
  updateVoice,
  updateVoiceSettings,
} from './config.actions';

const initialState: ConfigState = {
  voiceSettings: {
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
  },
  bannedWords: [],
};

export const configReducer = createReducer(
  initialState,
  on(updateConfigState, (state, { configState }) => ({
    ...state,
    ...configState,
  })),
  on(updateVoiceSettings, (state, { voiceSettings }) => ({
    ...state,
    voiceSettings: {
      ...voiceSettings,
    },
  })),
  on(updateBannedWords, (state, { bannedWords }) => ({
    ...state,
    bannedWords,
  })),
  on(updateLanguage, (state, { language }) => ({
    ...state,
    voiceSettings: {
      ...state.voiceSettings,
      streamElements: {
        ...state.voiceSettings.streamElements,
        language,
      },
    },
  })),
  on(updateVoice, (state, { voice }) => ({
    ...state,
    voiceSettings: {
      ...state.voiceSettings,
      streamElements: {
        ...state.voiceSettings.streamElements,
        voice,
      },
    },
  })),
  on(updateTtsMonsterAi, (state, { ai }) => ({
    ...state,
    voiceSettings: {
      ...state.voiceSettings,
      ttsMonster: {
        ...state.voiceSettings.ttsMonster,
        ai,
      },
    },
  })),
  on(updateTtsMonsterOverlayInfo, (state, { overlay, key, userId }) => ({
    ...state,
    voiceSettings: {
      ...state.voiceSettings,
      ttsMonster: {
        ...state.voiceSettings.ttsMonster,
        overlay,
        key,
        userId,
      },
    },
  })),
  on(updateUrl, (state, { url }) => ({
    ...state,
    voiceSettings: {
      ...state.voiceSettings,
      url,
    },
  })),
  on(updateTts, (state, { tts }) => ({
    ...state,
    voiceSettings: {
      ...state.voiceSettings,
      tts,
    },
  }))
);
