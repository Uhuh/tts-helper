import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TwitchState } from './twitch.model';

export const _selectTwitchState =
  createFeatureSelector<Readonly<TwitchState>>('twitchState');

export const selectTwitchState = createSelector(
  _selectTwitchState,
  (state) => state
);
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
export const selectTwitchRedeems = createSelector(
  selectTwitchChannelInfo,
  (state) => state.redeems
);
export const selectRedeem = createSelector(
  _selectTwitchState,
  (state) => state.redeem
);
export const selectRedeemCharLimit = createSelector(
  _selectTwitchState,
  (state) => state.redeemCharacterLimit
);
export const selectMinBits = createSelector(
  _selectTwitchState,
  (state) => state.minBits
);
export const selectBitsCharLimit = createSelector(
  _selectTwitchState,
  (state) => state.bitsCharacterLimit
);
