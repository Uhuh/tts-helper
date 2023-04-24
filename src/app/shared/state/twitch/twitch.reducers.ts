import { TwitchState } from './twitch.model';
import { createReducer, on } from '@ngrx/store';
import {
  updateBitsCharLimit,
  updateChannelInfo,
  updateChannelRedeems,
  updateMinBits,
  updateRedeem,
  updateRedeemCharLimit,
  updateToken,
  updateTokenValidity,
  updateTwitchState,
} from './twitch.actions';

const initialState: TwitchState = {
  token: null,
  isTokenValid: false,
  channelInfo: {
    channelId: '',
    username: '',
    redeems: [],
  },
  redeem: null,
  redeemCharacterLimit: 300,
  minBits: 100,
  bitsCharacterLimit: 300,
};

export const twitchReducer = createReducer(
  initialState,
  on(updateTwitchState, (state, { twitchState }) => ({
    ...state,
    ...twitchState,
    channelInfo: {
      ...twitchState.channelInfo,
    },
  })),
  on(updateToken, (state, { token }) => ({
    ...state,
    token,
  })),
  on(updateTokenValidity, (state, { isTokenValid }) => ({
    ...state,
    isTokenValid,
  })),
  on(updateChannelInfo, (state, { channelInfo }) => ({
    ...state,
    channelInfo: {
      ...channelInfo,
    },
  })),
  on(updateChannelRedeems, (state, { redeems }) => ({
    ...state,
    channelInfo: {
      ...state.channelInfo,
      redeems,
    },
  })),
  on(updateRedeem, (state, { redeem }) => ({
    ...state,
    redeem,
  })),
  on(updateRedeemCharLimit, (state, { redeemCharacterLimit }) => ({
    ...state,
    redeemCharacterLimit,
  })),
  on(updateMinBits, (state, { minBits }) => ({
    ...state,
    minBits,
  })),
  on(updateBitsCharLimit, (state, { bitsCharacterLimit }) => ({
    ...state,
    bitsCharacterLimit,
  }))
);
