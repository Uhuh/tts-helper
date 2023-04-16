import { TwitchState } from './twitch.model';
import { createReducer, on } from '@ngrx/store';
import {
  updateChannelInfo,
  updateToken,
  updateTokenValidity,
} from './twitch.actions';

const initialState: TwitchState = {
  token: null,
  /**
   * Assume valid as the token will be validated on launch.
   * If invalid we can alert the user with a snackbar message.
   */
  isTokenValid: true,
  channelInfo: {
    channelId: '',
    username: '',
  },
};

export const twitchReducer = createReducer(
  initialState,
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
  }))
);
