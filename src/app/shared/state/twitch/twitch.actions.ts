import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  TwitchBitState,
  TwitchChannelInfo,
  TwitchCustomMessageSetting,
  TwitchRedeemInfo,
  TwitchRedeemState,
  TwitchSettingsState,
  TwitchState,
  TwitchSubscriptionType,
} from './twitch.feature';

export const TwitchStateActions = createActionGroup({
  source: 'TwitchState',
  events: {
    'Update Token': props<{ token: string | null }>(),
    'Update Settings': props<{ partialState: Partial<TwitchSettingsState> }>(),
    'Update Redeems': props<{ redeems: TwitchRedeemInfo[] }>(),
    'Update State': props<{ twitchState: Partial<TwitchState> }>(),
    'Update Is Token Valid': props<{ isTokenValid: boolean }>(),
    'Update Channel Info': props<{ channelInfo: TwitchChannelInfo }>(),

    'Update Bits': props<{ partialSettings: Partial<TwitchBitState> }>(),
    'Update Follow Settings': props<{ partialSettings: Partial<TwitchCustomMessageSetting> }>(),
    'Update Redeems Settings': props<{ partialSettings: Partial<TwitchRedeemState> }>(),
    'Update Gifted Subscriptions': props<{ partialSettings: Partial<TwitchSubscriptionType> }>(),
    'Update Renew Subscriptions': props<{ partialSettings: Partial<TwitchSubscriptionType> }>(),

    'Reset State': emptyProps(),
  },
});
