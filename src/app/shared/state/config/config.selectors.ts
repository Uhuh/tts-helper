import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConfigState } from './config.model';

export const _selectConfigState =
  createFeatureSelector<Readonly<ConfigState>>('configState');

export const selectConfigState = createSelector(
  _selectConfigState,
  (state) => state
);

export const selectStreamElements = createSelector(
  _selectConfigState,
  (state) => state.streamElements
);

export const selectTtsMonster = createSelector(
  _selectConfigState,
  (state) => state.ttsMonster
);

export const selectAmazonPolly = createSelector(
  _selectConfigState,
  (state) => state.amazonPolly
);

export const selectTikTok = createSelector(
  _selectConfigState,
  (state) => state.tikTok
);

export const selectTts = createSelector(
  _selectConfigState,
  (state) => state.tts
);

export const selectUrl = createSelector(
  _selectConfigState,
  (state) => state.url
);

export const selectAudioDevice = createSelector(
  _selectConfigState,
  (state) => state.audioDevice
);

export const selectDeviceVolume = createSelector(
  _selectConfigState,
  (state) => state.deviceVolume
);

export const selectBannedWords = createSelector(
  _selectConfigState,
  (state) => state.bannedWords
);

export const selectBannedWordsLength = createSelector(
  selectBannedWords,
  (state) => state.length
);
