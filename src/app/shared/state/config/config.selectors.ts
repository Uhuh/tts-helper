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

export const selectBannedWords = createSelector(
  _selectConfigState,
  (state) => state.bannedWords
);

export const selectBannedWordsLength = createSelector(
  selectBannedWords,
  (state) => state.length
);
