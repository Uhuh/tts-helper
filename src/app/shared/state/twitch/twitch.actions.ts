import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TwitchChannelInfo, TwitchRedeemInfo, TwitchState } from './twitch.feature';

export const TwitchStateActions = createActionGroup({
  source: 'TwitchState',
  events: {
    'Update Token': props<{ token: string | null }>(),
    'Update Redeems': props<{ redeems: TwitchRedeemInfo[] }>(),
    'Update State': props<{ twitchState: TwitchState }>(),
    'Update Is Token Valid': props<{ isTokenValid: boolean }>(),
    'Update Channel Info': props<{ channelInfo: TwitchChannelInfo }>(),
    'Update Sub Enabled': props<{ enabled: boolean }>(),
    'Update Sub Char Limit': props<{ subCharacterLimit: number }>(),
    'Update Sub Gift Message': props<{ giftMessage: string }>(),
    'Update Redeem Enabled': props<{ enabled: boolean }>(),
    'Update Selected Redeem': props<{ redeem: string | null }>(),
    'Update Redeem Char Limit': props<{ redeemCharacterLimit: number }>(),
    'Update Bits Enabled': props<{ enabled: boolean }>(),
    'Update Bits Exact': props<{ exact: boolean }>(),
    'Update Bits Min': props<{ minBits: number }>(),
    'Update Bits Char Limit': props<{ bitsCharacterLimit: number }>(),
    'Reset State': emptyProps(),
  }
});
