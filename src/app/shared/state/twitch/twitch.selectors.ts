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

export const selectRedeemInfo = createSelector(
  _selectTwitchState,
  (state) => state.redeemInfo
);
export const selectRedeemEnabled = createSelector(
  selectRedeemInfo,
  (state) => state.enabled
);
export const selectRedeem = createSelector(
  selectRedeemInfo,
  (state) => state.redeem
);
export const selectRedeemCharLimit = createSelector(
  selectRedeemInfo,
  (state) => state.redeemCharacterLimit
);

export const selectBitInfo = createSelector(
  _selectTwitchState,
  (state) => state.bitInfo
);
export const selectBitEnabled = createSelector(
  selectBitInfo,
  (state) => state.enabled
);
export const selectMinBits = createSelector(
  selectBitInfo,
  (state) => state.minBits
);
export const selectBitsCharLimit = createSelector(
  selectBitInfo,
  (state) => state.bitsCharacterLimit
);
