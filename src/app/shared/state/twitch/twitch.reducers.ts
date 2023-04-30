import { TwitchState } from './twitch.model';
import { createReducer, on } from '@ngrx/store';
import {
  updateBitEnabled,
  updateBitsCharLimit,
  updateChannelInfo,
  updateChannelRedeems,
  updateMinBits,
  updateRedeem,
  updateRedeemCharLimit,
  updateRedeemEnabled,
  updateSubCharLimit,
  updateSubEnabled,
  updateToken,
  updateTokenValidity,
  updateTwitchState,
} from './twitch.actions';

const initialState: TwitchState = {
  token: null,
  isTokenValid: false,
  subsInfo: {
    enabled: true,
    subCharacterLimit: 300,
  },
  channelInfo: {
    channelId: '',
    username: '',
    redeems: [],
  },
  redeemInfo: {
    enabled: true,
    redeem: null,
    redeemCharacterLimit: 300,
  },
  bitInfo: {
    enabled: true,
    minBits: 100,
    bitsCharacterLimit: 300,
  },
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
  on(updateSubEnabled, (state, { enabled }) => ({
    ...state,
    subsInfo: {
      ...state.subsInfo,
      enabled,
    },
  })),
  on(updateSubCharLimit, (state, { subCharacterLimit }) => ({
    ...state,
    subsInfo: {
      ...state.subsInfo,
      subCharacterLimit,
    },
  })),
  on(updateRedeemEnabled, (state, { enabled }) => ({
    ...state,
    redeemInfo: {
      ...state.redeemInfo,
      enabled,
    },
  })),
  on(updateRedeem, (state, { redeem }) => ({
    ...state,
    redeemInfo: {
      ...state.redeemInfo,
      redeem,
    },
  })),
  on(updateRedeemCharLimit, (state, { redeemCharacterLimit }) => ({
    ...state,
    redeemInfo: {
      ...state.redeemInfo,
      redeemCharacterLimit,
    },
  })),
  on(updateBitEnabled, (state, { enabled }) => ({
    ...state,
    bitInfo: {
      ...state.bitInfo,
      enabled,
    },
  })),
  on(updateMinBits, (state, { minBits }) => ({
    ...state,
    bitInfo: {
      ...state.bitInfo,
      minBits,
    },
  })),
  on(updateBitsCharLimit, (state, { bitsCharacterLimit }) => ({
    ...state,
    bitInfo: {
      ...state.bitInfo,
      bitsCharacterLimit,
    },
  }))
);
