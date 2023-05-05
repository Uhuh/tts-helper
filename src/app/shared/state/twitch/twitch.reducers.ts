import { TwitchState } from './twitch.model';
import { createReducer, on } from '@ngrx/store';
import {
  twitchInfo,
  twitchRedeemInfo,
  twitchBitsInfo,
  twitchSubInfo,
} from './twitch.actions';

const initialState: TwitchState = {
  token: null,
  isTokenValid: false,
  subsInfo: {
    enabled: true,
    giftMessage: '',
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
    exact: false,
    minBits: 100,
    bitsCharacterLimit: 300,
  },
};

export const twitchReducer = createReducer(
  initialState,
  on(twitchInfo.twitchState, (state, { twitchState }) => ({
    ...state,
    ...twitchState,
    channelInfo: {
      ...twitchState.channelInfo,
    },
  })),
  on(twitchInfo.token, (state, { token }) => ({
    ...state,
    token,
  })),
  on(twitchInfo.isTokenValid, (state, { isTokenValid }) => ({
    ...state,
    isTokenValid,
  })),
  on(twitchInfo.channelInfo, (state, { channelInfo }) => ({
    ...state,
    channelInfo: {
      ...channelInfo,
    },
  })),
  on(twitchInfo.redeems, (state, { redeems }) => ({
    ...state,
    channelInfo: {
      ...state.channelInfo,
      redeems,
    },
  })),
  on(twitchSubInfo.enabled, (state, { enabled }) => ({
    ...state,
    subsInfo: {
      ...state.subsInfo,
      enabled,
    },
  })),
  on(twitchSubInfo.subCharLimit, (state, { subCharacterLimit }) => ({
    ...state,
    subsInfo: {
      ...state.subsInfo,
      subCharacterLimit,
    },
  })),
  on(twitchSubInfo.giftMessage, (state, { giftMessage }) => ({
    ...state,
    subsInfo: {
      ...state.subsInfo,
      giftMessage,
    },
  })),
  on(twitchBitsInfo.enabled, (state, { enabled }) => ({
    ...state,
    redeemInfo: {
      ...state.redeemInfo,
      enabled,
    },
  })),
  on(twitchBitsInfo.enabled, (state, { enabled }) => ({
    ...state,
    bitInfo: {
      ...state.bitInfo,
      enabled,
    },
  })),
  on(twitchBitsInfo.minBits, (state, { minBits }) => ({
    ...state,
    bitInfo: {
      ...state.bitInfo,
      minBits,
    },
  })),
  on(twitchBitsInfo.bitsCharLimit, (state, { bitsCharacterLimit }) => ({
    ...state,
    bitInfo: {
      ...state.bitInfo,
      bitsCharacterLimit,
    },
  })),
  on(twitchRedeemInfo.redeem, (state, { redeem }) => ({
    ...state,
    redeemInfo: {
      ...state.redeemInfo,
      redeem,
    },
  })),
  on(twitchRedeemInfo.redeemCharLimit, (state, { redeemCharacterLimit }) => ({
    ...state,
    redeemInfo: {
      ...state.redeemInfo,
      redeemCharacterLimit,
    },
  }))
);
