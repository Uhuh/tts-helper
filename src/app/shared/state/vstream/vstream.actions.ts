import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { VStreamSettingsState, VStreamState, VStreamTokenResponse } from './vstream.feature';

export const VStreamActions = createActionGroup({
  source: 'VStream',
  events: {
    'Update State': props<{ partialState: Partial<VStreamState> }>(),
    'Update Token': props<{ token: VStreamTokenResponse }>(),
    'Update Settings': props<{ partialSettings: Partial<VStreamSettingsState> }>(),
    'Clear State': emptyProps(),
  },
});