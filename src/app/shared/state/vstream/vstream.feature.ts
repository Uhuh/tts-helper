﻿import { createFeature, createReducer, on } from '@ngrx/store';
import { VStreamActions } from './vstream.actions';
import { VStreamChannelID } from '../../services/vstream-pubsub.interface';

export type VStreamTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
};

export type VStreamToken = {
  expireDate: number;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
};

export type VStreamSettingsState = {
  randomChance: number;
};

export type VStreamChannelState = {
  username: string;
  channelId: VStreamChannelID;
  pictureUrl: string;
  channelUrl: string;
};

export type VStreamCustomMessageState = {
  enabled: boolean;
  enabledGpt: boolean;
  enabledChat: boolean;
  customMessage: string;
};

export type VStreamSubscriptionSettingsState = {
  renew: VStreamCustomMessageState;
  gifted: VStreamCustomMessageState;
};

export type VStreamChatCommand = {
  command: string;
};

export type VStreamState = {
  token: VStreamToken;
  chatCommands: VStreamChatCommand[];
  channelInfo: VStreamChannelState;
  settings: VStreamSettingsState;
  uplift: VStreamCustomMessageState;
  meteorShower: VStreamCustomMessageState;
  subscriptions: VStreamSubscriptionSettingsState;
  followers: VStreamCustomMessageState;
};

const initialCustomMessage: VStreamCustomMessageState = {
  customMessage: '',
  enabledGpt: false,
  enabled: false,
  enabledChat: false,
};

const initialState: VStreamState = {
  chatCommands: [],
  token: {
    accessToken: '',
    idToken: '',
    refreshToken: '',
    expireDate: -1,
    expiresIn: -1,
  },
  channelInfo: {
    username: '',
    channelId: 'chan_',
    pictureUrl: '',
    channelUrl: '',
  },
  settings: {
    randomChance: 0,
  },
  uplift: initialCustomMessage,
  meteorShower: initialCustomMessage,
  subscriptions: {
    renew: initialCustomMessage,
    gifted: initialCustomMessage,
  },
  followers: initialCustomMessage,
};

export const VStreamFeature = createFeature({
  name: 'VStreamFeature',
  reducer: createReducer(
    initialState,
    on(VStreamActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
    on(VStreamActions.updateChannel, (state, { partialChannel }) => ({
      ...state,
      channelInfo: {
        ...state.channelInfo,
        ...partialChannel,
      },
    })),
    on(VStreamActions.updateSettings, (state, { partialSettings }) => ({
      ...state,
      settings: {
        ...state.settings,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateUpLift, (state, { partialSettings }) => ({
      ...state,
      uplift: {
        ...state.uplift,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateMeteorShower, (state, { partialSettings }) => ({
      ...state,
      meteorShower: {
        ...state.meteorShower,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateRenewalSubscriptions, (state, { partialSettings }) => ({
      ...state,
      subscriptions: {
        ...state.subscriptions,
        renew: {
          ...state.subscriptions.renew,
          ...partialSettings,
        },
      },
    })),
    on(VStreamActions.updateGiftedSubscriptions, (state, { partialSettings }) => ({
      ...state,
      subscriptions: {
        ...state.subscriptions,
        gifted: {
          ...state.subscriptions.gifted,
          ...partialSettings,
        },
      },
    })),
    on(VStreamActions.updateFollowers, (state, { partialSettings }) => ({
      ...state,
      followers: {
        ...state.followers,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateToken, (state, { token }) => ({
      ...state,
      token: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expireDate: Date.now() + token.expires_in * 1000,
        idToken: token.id_token,
        expiresIn: token.expires_in,
      },
    })),
    on(VStreamActions.clearToken, (state) => ({
      ...state,
      token: {
        ...initialState.token,
      },
    })),
  ),
});