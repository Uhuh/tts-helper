import { createActionGroup, props } from '@ngrx/store';
import { EmoteToExpression, VTubeStudioState } from './vtubestudio.feature.';

export const VTubeStudioActions = createActionGroup({
  source: 'VTubeStudio',
  events: {
    'Update State': props<{ partialState: Partial<VTubeStudioState> }>(),
    'Create Emote To Expression': props<{ partialSettings?: Partial<EmoteToExpression> }>(),
    'Update Emote To Expression': props<{ id: string, partialSettings: Partial<EmoteToExpression> }>(),
    'Delete Emote To Expression': props<{ id: string }>(),
  },
});