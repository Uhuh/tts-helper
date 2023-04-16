import { createAction, props } from '@ngrx/store';
import { TwitchChannelInfo } from './twitch.interface';

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
