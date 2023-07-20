import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { TwitchStateActions } from './twitch.actions';

export interface TwitchRedeemInfo {
  id: string;
  title: string;
  cost: number;
  prompt: string;
}

export interface TwitchChannelInfo {
  channelId: string;
  username: string;
  redeems: TwitchRedeemInfo[];
}

export interface ValidUser {
  user_id: string;
  login: string;
  scopes: string[];
  expires_in: number;
}

export interface TwitchRedeemState {
  enabled: boolean;
  redeem: string | null;
  redeemCharacterLimit: number;
}

export interface TwitchBitState {
  enabled: boolean;
  exact: boolean;
  minBits: number;
  bitsCharacterLimit: number;
}

export interface TwitchSubState {
  enabled: boolean;
  giftMessage: string;
  subCharacterLimit: number;
}

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  subsInfo: TwitchSubState;
  channelInfo: TwitchChannelInfo;
  bitInfo: TwitchBitState;
  redeemInfo: TwitchRedeemState;
}

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

export const twitchFeature = createFeature({
  name: 'TwitchState',
  reducer: createReducer(
    initialState,
    on(TwitchStateActions.updateState, (state, { twitchState }) => ({
      ...state,
      ...twitchState,
      channelInfo: {
        ...twitchState.channelInfo,
      },
    })),
    on(TwitchStateActions.updateToken, (state, { token }) => ({
      ...state,
      token,
    })),
    on(TwitchStateActions.updateIsTokenValid, (state, { isTokenValid }) => ({
      ...state,
      isTokenValid,
    })),
    on(TwitchStateActions.updateChannelInfo, (state, { channelInfo }) => ({
      ...state,
      channelInfo: {
        ...channelInfo,
      },
    })),
    on(TwitchStateActions.updateRedeems, (state, { redeems }) => ({
      ...state,
      channelInfo: {
        ...state.channelInfo,
        redeems,
      },
    })),
    on(TwitchStateActions.updateSubEnabled, (state, { enabled }) => ({
      ...state,
      subsInfo: {
        ...state.subsInfo,
        enabled,
      },
    })),
    on(TwitchStateActions.updateSubCharLimit, (state, { subCharacterLimit }) => ({
      ...state,
      subsInfo: {
        ...state.subsInfo,
        subCharacterLimit,
      },
    })),
    on(TwitchStateActions.updateSubGiftMessage, (state, { giftMessage }) => ({
      ...state,
      subsInfo: {
        ...state.subsInfo,
        giftMessage,
      },
    })),
    on(TwitchStateActions.updateRedeemEnabled, (state, { enabled }) => ({
      ...state,
      redeemInfo: {
        ...state.redeemInfo,
        enabled,
      },
    })),
    on(TwitchStateActions.updateBitsEnabled, (state, { enabled }) => ({
      ...state,
      bitInfo: {
        ...state.bitInfo,
        enabled,
      },
    })),
    on(TwitchStateActions.updateBitsMin, (state, { minBits }) => ({
      ...state,
      bitInfo: {
        ...state.bitInfo,
        minBits,
      },
    })),
    on(TwitchStateActions.updateBitsCharLimit, (state, { bitsCharacterLimit }) => ({
      ...state,
      bitInfo: {
        ...state.bitInfo,
        bitsCharacterLimit,
      },
    })),
    on(TwitchStateActions.updateSelectedRedeem, (state, { redeem }) => ({
      ...state,
      redeemInfo: {
        ...state.redeemInfo,
        redeem,
      },
    })),
    on(TwitchStateActions.updateRedeemCharLimit, (state, { redeemCharacterLimit }) => ({
      ...state,
      redeemInfo: {
        ...state.redeemInfo,
        redeemCharacterLimit,
      },
    })),
    on(TwitchStateActions.resetState, () => ({
      ...initialState,
    })),
  ),
  extraSelectors: ({
     selectRedeemInfo,
     selectChannelInfo,
     selectBitInfo,
     selectSubsInfo,
   }) => ({
    selectRedeems: createSelector(
      selectChannelInfo,
      (channelInfo) => channelInfo.redeems,
    ),
    selectSubEnabed: createSelector(
      selectSubsInfo,
      (subInfo) => subInfo.enabled,
    ),
    selectSubsCharLimit: createSelector(
      selectSubsInfo,
      (subInfo) => subInfo.subCharacterLimit,
    ),
    selectRedeemsEnabled: createSelector(
      selectRedeemInfo,
      (redeemInfo) => redeemInfo.enabled,
    ),
    selectSelectedRedeem: createSelector(
      selectRedeemInfo,
      (redeemInfo) => redeemInfo.redeem,
    ),
    selectRedeemCharLimit: createSelector(
      selectRedeemInfo,
      (redeemInfo) => redeemInfo.redeemCharacterLimit,
    ),
    selectBitsEnabled: createSelector(
      selectBitInfo,
      (bitInfo) => bitInfo.enabled,
    ),
    selectBitsMin: createSelector(
      selectBitInfo,
      (bitInfo) => bitInfo.minBits,
    ),
    selectBitsCharLimit: createSelector(
      selectBitInfo,
      (bitInfo) => bitInfo.bitsCharacterLimit,
    ),
  }),
});
