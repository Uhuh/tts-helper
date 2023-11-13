import { createActionGroup, props } from '@ngrx/store';
import { ElevenLabsState } from './eleven-labs.feature';

export const ElevenLabsActions = createActionGroup({
  source: 'ElevenLabs',
  events: {
    'Update State': props<{ partialState: Partial<ElevenLabsState> }>(),
  },
});