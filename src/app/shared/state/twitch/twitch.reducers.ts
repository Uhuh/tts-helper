import { TwitchState } from './twitch.model';
import { createReducer, on } from '@ngrx/store';
import {
  updateChannelInfo,
  updateChannelRedeems,
  updateRedeem,
  updateRedeemCharLimit,
  updateToken,
  updateTokenValidity,
  updateTwitchState,
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
    redeems: [],
  },
  redeem: null,
  redeemCharacterLimit: 300,
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
  }))
);
