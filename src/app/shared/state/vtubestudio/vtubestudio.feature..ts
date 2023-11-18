import { createFeature, createReducer, on } from '@ngrx/store';
import { VTubeStudioActions } from './vtubestudio.actions';

export interface VTubeStudioState {
  port: number;
  isMirrorMouthFormEnabled: boolean;
  isMirrorMouthOpenEnabled: boolean;
}

const initalState: VTubeStudioState = {
  isMirrorMouthFormEnabled: false,
  isMirrorMouthOpenEnabled: false,
  port: 8001, // This is VTS' default
};

export const VTubeStudioFeature = createFeature({
  name: 'VTubeStudioFeature',
  reducer: createReducer(
    initalState,
    on(VTubeStudioActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
  ),
});