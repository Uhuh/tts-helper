import { createFeature, createReducer, on } from '@ngrx/store';
import { VStreamActions } from './vstream.actions';

export type VStreamTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
};

export type VStreamToken = {
  expireDate: number,
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
};

export type VStreamSettingsState = {
  randomChance: number;
};

export type VStreamState = {
  token: VStreamToken;
  channelInfo: {
    username: string;
    channelId: string;
    pictureUrl: string;
    channelUrl: string;
  };
  settings: VStreamSettingsState
};

const initialState: VStreamState = {
  token: {
    accessToken: '',
    idToken: '',
    refreshToken: '',
    expireDate: -1,
    expiresIn: -1,
  },
  channelInfo: {
    username: '',
    channelId: '',
    pictureUrl: '',
    channelUrl: '',
  },
  settings: {
    randomChance: 0,
  },
};

export const VStreamFeature = createFeature({
  name: 'VStreamFeature',
  reducer: createReducer(
    initialState,
    on(VStreamActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
    on(VStreamActions.updateSettings, (state, { partialSettings }) => ({
      ...state,
      settings: {
        ...state.settings,
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
    on(VStreamActions.clearState, () => ({
      ...initialState,
    })),
  ),
});