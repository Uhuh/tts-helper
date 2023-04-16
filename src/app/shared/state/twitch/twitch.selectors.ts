import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TwitchState } from './twitch.model';

export const _selectTwitchState =
  createFeatureSelector<Readonly<TwitchState>>('twitchState');

export const selectTwitchToken = createSelector(
  _selectTwitchState,
  (state) => state.token
);
export const selectIsTokenValid = createSelector(
  _selectTwitchState,
  (state) => state.isTokenValid
);
export const selectTwitchChannelInfo = createSelector(
  _selectTwitchState,
  (state) => state.channelInfo
);
