import { createReducer, on } from '@ngrx/store';
import { ConfigState } from './config.model';
import {
  updateBannedWords,
  updateConfigState,
  updateLanguage,
  updateTts,
  updateUrl,
  updateVoice,
  updateVoiceSettings,
} from './config.actions';

const initialState: ConfigState = {
  voiceSettings: {
    tts: 'stream-elements',
    url: 'https://api.streamelements.com/kappa/v2/speech',
    voice: '',
    language: '',
    voiceQueryParam: '',
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
      language,
    },
  })),
  on(updateVoice, (state, { voice }) => ({
    ...state,
    voiceSettings: {
      ...state.voiceSettings,
      voice,
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
