import { createReducer, on } from '@ngrx/store';
import { ConfigState } from './config.model';
import { updateBannedWords, updateVoiceSettings } from './config.actions';

const initialState: ConfigState = {
  voiceSettings: {
    url: '',
    voice: '',
    voiceQueryParam: '',
  },
  bannedWords: [],
};

export const configReducer = createReducer(
  initialState,
  on(updateVoiceSettings, (state, { voiceSettings }) => ({
    ...state,
    voiceSettings: {
      ...voiceSettings,
    },
  })),
  on(updateBannedWords, (state, { bannedWords }) => ({
    ...state,
    bannedWords,
  }))
);
