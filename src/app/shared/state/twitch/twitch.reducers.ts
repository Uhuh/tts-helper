import { TwitchState } from './twitch.model';
import { createReducer, on } from '@ngrx/store';
import {
  updateChannelInfo,
  updateChannelRedeems,
  updateRedeemCharLimit,
  updateSelectedRedeem,
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
    redeems: [],
  },
  redeem: null,
  redeemCharacterLimit: 300,
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
  })),
  on(updateChannelRedeems, (state, { redeems }) => ({
    ...state,
    channelInfo: {
      ...state.channelInfo,
      redeems,
    },
  })),
  on(updateSelectedRedeem, (state, { selectedRedeem }) => ({
    ...state,
    selectedRedeem,
  })),
  on(updateRedeemCharLimit, (state, { redeemCharacterLimit }) => ({
    ...state,
    redeemCharacterLimit,
  }))
);
