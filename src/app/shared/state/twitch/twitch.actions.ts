import { createAction, createActionGroup, props } from '@ngrx/store';
import { TwitchChannelInfo, TwitchRedeemInfo } from './twitch.interface';
import { TwitchState } from './twitch.model';

export const twitchInfo = createActionGroup({
  source: 'TwitchState - Twitch Info',
  events: {
    Token: props<{ token: string | null }>(),
    Redeems: props<{ redeems: TwitchRedeemInfo[] }>(),
    'Twitch State': props<{ twitchState: TwitchState }>(),
    'Is Token Valid': props<{ isTokenValid: boolean }>(),
    'Channel Info': props<{ channelInfo: TwitchChannelInfo }>(),
  },
});

export const twitchSubInfo = createActionGroup({
  source: 'TwitchState - Twitch Sub Info',
  events: {
    Enabled: props<{ enabled: boolean }>(),
    'Sub Char Limit': props<{ subCharacterLimit: number }>(),
    'Gift Message': props<{ giftMessage: string }>(),
  },
});

export const twitchRedeemInfo = createActionGroup({
  source: 'TwitchState - Twitch Redeem Info',
  events: {
    Enabled: props<{ enabled: boolean }>(),
    Redeem: props<{ redeem: string | null }>(),
    'Redeem Char Limit': props<{ redeemCharacterLimit: number }>(),
  },
});

export const twitchBitsInfo = createActionGroup({
  source: 'TwitchState - Twitch Bits Info',
  events: {
    Exact: props<{ exact: boolean }>(),
    Enabled: props<{ enabled: boolean }>(),
    'Min Bits': props<{ minBits: number }>(),
    'Bits Char Limit': props<{ bitsCharacterLimit: number }>(),
  },
});
