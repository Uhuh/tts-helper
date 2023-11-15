import { createActionGroup, props } from '@ngrx/store';
import { AudioItem, AudioStatus } from './audio.feature';

export const AudioActions = createActionGroup({
  source: 'AudioState',
  events: {
    'Update Audio State': props<{ id: number; audioState: AudioStatus }>(),
    'Add Audio Item': props<{ audio: AudioItem }>(),
    'Remove Audio Item': props<{ audioId: number }>(),
  },
});