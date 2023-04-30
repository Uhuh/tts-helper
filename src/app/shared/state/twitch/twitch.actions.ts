import { createAction, props } from '@ngrx/store';
import { TwitchChannelInfo, TwitchRedeemInfo } from './twitch.interface';
import { TwitchState } from './twitch.model';

export const updateTwitchState = createAction(
  '[ TwitchState ] Updating whole state',
  props<{ twitchState: TwitchState }>()
);
export const updateToken = createAction(
  '[ TwitchState ] Updating token',
  props<{ token: string | null }>()
);
export const updateTokenValidity = createAction(
  '[ TwitchState ] Updating token validity',
  props<{ isTokenValid: boolean }>()
);
export const updateChannelInfo = createAction(
  '[ TwitchState ] Updating channel info',
  props<{ channelInfo: TwitchChannelInfo }>()
);
export const updateChannelRedeems = createAction(
  '[ TwitchState ] Updating channel redeems',
  props<{ redeems: TwitchRedeemInfo[] }>()
);

export const updateSubEnabled = createAction(
  '[ TwitchState ] Updating sub info enabled',
  props<{ enabled: boolean }>()
);
export const updateSubCharLimit = createAction(
  '[ TwitchState ] Updating sub info char limit',
  props<{ subCharacterLimit: number }>()
);

export const updateRedeemEnabled = createAction(
  '[ TwitchState ] Updating redeem info enabled',
  props<{ enabled: boolean }>()
);
export const updateRedeem = createAction(
  '[ TwitchState ] Updating redeem',
  props<{ redeem: string | null }>()
);
export const updateRedeemCharLimit = createAction(
  '[ TwitchState ] Updating redeem character limit',
  props<{ redeemCharacterLimit: number }>()
);

export const updateBitEnabled = createAction(
  '[ TwitchState ] Updating bit info enabled',
  props<{ enabled: boolean }>()
);
export const updateMinBits = createAction(
  '[ TwitchState ] Updating min bits',
  props<{ minBits: number }>()
);
export const updateBitsCharLimit = createAction(
  '[ TwitchState ] Updating bits character limit',
  props<{ bitsCharacterLimit: number }>()
);
