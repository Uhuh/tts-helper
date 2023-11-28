import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  TwitchChannelInfo,
  TwitchRedeemInfo,
  TwitchRedeemState,
  TwitchSettingsState,
  TwitchState,
} from './twitch.feature';

export const TwitchStateActions = createActionGroup({
  source: 'TwitchState',
  events: {
    'Update Token': props<{ token: string | null }>(),
    'Update Settings': props<{ partialState: Partial<TwitchSettingsState> }>(),
    'Update Redeems': props<{ redeems: TwitchRedeemInfo[] }>(),
    'Update State': props<{ twitchState: TwitchState }>(),
    'Update Is Token Valid': props<{ isTokenValid: boolean }>(),
    'Update Channel Info': props<{ channelInfo: TwitchChannelInfo }>(),
    'Update Sub Enabled': props<{ enabled: boolean }>(),
    'Update Sub Char Limit': props<{ subCharacterLimit: number }>(),
    'Update Sub Gift Message': props<{ giftMessage: string }>(),
    'Update Redeem Info': props<{ redeemInfo: Partial<TwitchRedeemState> }>(),
    'Update Bits Enabled': props<{ enabled: boolean }>(),
    'Update Bits Exact': props<{ exact: boolean }>(),
    'Update Bits Min': props<{ minBits: number }>(),
    'Update Bits Char Limit': props<{ bitsCharacterLimit: number }>(),
    'Reset State': emptyProps(),
  },
});
