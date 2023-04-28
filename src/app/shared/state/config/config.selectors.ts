import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConfigState } from './config.model';

export const _selectConfigState =
  createFeatureSelector<Readonly<ConfigState>>('configState');

export const selectConfigState = createSelector(
  _selectConfigState,
  (state) => state
);

export const selectVoiceSettings = createSelector(
  _selectConfigState,
  (state) => state.voiceSettings
);

export const selectStreamElements = createSelector(
  selectVoiceSettings,
  (state) => state.streamElements
);

export const selectTtsMonster = createSelector(
  selectVoiceSettings,
  (state) => state.ttsMonster
);

export const selectVoiceSettingsTts = createSelector(
  selectVoiceSettings,
  (state) => state.tts
);

export const selectBannedWords = createSelector(
  _selectConfigState,
  (state) => state.bannedWords
);

export const selectBannedWordsLength = createSelector(
  selectBannedWords,
  (state) => state.length
);
