import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { TwitchStateActions } from './twitch.actions';

export interface TwitchCustomMessageSetting {
  enabled: boolean;
  enabledGpt: boolean;
  customMessage: string;
}

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
  redeem: string;
  gptRedeem: string;
  redeemCharacterLimit: number;
}

export interface TwitchBitState {
  enabled: boolean;
  exact: boolean;
  minBits: number;
  bitsCharacterLimit: number;
}

export type TwitchSubscriptionType = {
  enabled: boolean;
  readMessageEnabled: boolean;
  customMessage: string;
  characterLimit: number;
};

export interface TwitchSubscriptionState {
  renew: TwitchSubscriptionType;
  gift: TwitchSubscriptionType;
}

export interface TwitchSettingsState {
  randomChance: number;
}

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  channelInfo: TwitchChannelInfo;
  settings: TwitchSettingsState;
  subscriptions: TwitchSubscriptionState;
  follower: TwitchCustomMessageSetting;
  bitInfo: TwitchBitState;
  redeemInfo: TwitchRedeemState;
}

const initialState: TwitchState = {
  token: null,
  isTokenValid: false,
  settings: {
    randomChance: 0,
  },
  subscriptions: {
    gift: {
      enabled: true,
      readMessageEnabled: false,
      characterLimit: 300,
      customMessage: 'Thanks {username} for the {amount} subs!',
    },
    renew: {
      enabled: true,
      readMessageEnabled: false,
      characterLimit: 300,
      customMessage: 'Thanks {username} for the tier {amount} sub!',
    },
  },
  follower: {
    enabled: false,
    enabledGpt: false,
    customMessage: 'Thanks {username} for following',
  },
  channelInfo: {
    channelId: '',
    username: '',
    redeems: [],
  },
  redeemInfo: {
    enabled: true,
    redeem: '',
    gptRedeem: '',
    redeemCharacterLimit: 300,
  },
  bitInfo: {
    enabled: true,
    exact: false,
    minBits: 100,
    bitsCharacterLimit: 300,
  },
};

export const TwitchFeature = createFeature({
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
    on(TwitchStateActions.updateSettings, (state, { partialState }) => ({
      ...state,
      settings: {
        ...state.settings,
        ...partialState,
      },
    })),
    on(TwitchStateActions.updateFollowSettings, (state, { partialSettings }) => ({
      ...state,
      follower: {
        ...state.follower,
        ...partialSettings,
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
    on(TwitchStateActions.updateRenewSubscriptions, (state, { partialSettings }) => ({
      ...state,
      subscriptions: {
        ...state.subscriptions,
        renew: {
          ...state.subscriptions.renew,
          ...partialSettings,
        },
      },
    })),
    on(TwitchStateActions.updateGiftedSubscriptions, (state, { partialSettings }) => ({
      ...state,
      subscriptions: {
        ...state.subscriptions,
        gift: {
          ...state.subscriptions.gift,
          ...partialSettings,
        },
      },
    })),
    on(TwitchStateActions.updateRedeemsSettings, (state, { partialSettings }) => ({
      ...state,
      redeemInfo: {
        ...state.redeemInfo,
        ...partialSettings,
      },
    })),
    on(TwitchStateActions.resetState, () => ({
      ...initialState,
    })),
  ),
  extraSelectors: ({
    selectChannelInfo,
  }) => ({
    selectRedeems: createSelector(selectChannelInfo, channelInfo => channelInfo.redeems),
  }),
});
