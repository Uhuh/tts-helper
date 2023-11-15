import { createActionGroup, props } from '@ngrx/store';
import { AzureState } from './azure.feature';

export const AzureActions = createActionGroup({
  source: 'Azure',
  events: {
    'Update Azure State': props<{ partialState: Partial<AzureState> }>(),
  },
});