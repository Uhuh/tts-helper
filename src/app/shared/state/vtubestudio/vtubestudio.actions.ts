import { createActionGroup, props } from '@ngrx/store';
import { VTubeStudioState } from './vtubestudio.feature.';

export const VTubeStudioActions = createActionGroup({
  source: 'VTubeStudio',
  events: {
    'Update State': props<{ partialState: Partial<VTubeStudioState> }>(),
  },
});