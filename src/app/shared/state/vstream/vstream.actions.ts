import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { VStreamState, VStreamTokenResponse } from './vstream.feature';

export const VStreamActions = createActionGroup({
  source: 'VStream',
  events: {
    'Update State': props<{ partialState: Partial<VStreamState> }>(),
    'Update Token': props<{ token: VStreamTokenResponse }>(),
    'Clear State': emptyProps(),
  },
});