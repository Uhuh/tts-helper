import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  VStreamChannelState,
  VStreamCustomMessageState,
  VStreamSettingsState,
  VStreamState,
  VStreamTokenResponse,
} from './vstream.feature';

export const VStreamActions = createActionGroup({
  source: 'VStream',
  events: {
    'Update State': props<{ partialState: Partial<VStreamState> }>(),
    'Update Token': props<{ token: VStreamTokenResponse }>(),
    'Update Channel': props<{ partialChannel: Partial<VStreamChannelState> }>(),
    'Update Settings': props<{ partialSettings: Partial<VStreamSettingsState> }>(),
    'Update Up Lift': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Meteor Shower': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Renewal Subscriptions': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Gifted Subscriptions': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Followers': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Clear Token': emptyProps(),
  },
});