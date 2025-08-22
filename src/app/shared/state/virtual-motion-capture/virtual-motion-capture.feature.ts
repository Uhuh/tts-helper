import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from "@angular/core";

export type VirtualMotionCaptureState = {
  enabled: boolean;
  port: number;
  host: string;
  mouth_a_param: string;
  mouth_e_param: string;
  blendshape_modifier: number;
};

const initialState: VirtualMotionCaptureState = {
  enabled: false,
  port: 39539,
  host: '127.0.0.1',
  mouth_a_param: 'A',
  mouth_e_param: 'E',
  blendshape_modifier: 100,
};

export const VirtualMotionCaptureFeature = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(state => ({
    updateState: (partialState: Partial<VirtualMotionCaptureState>) => {
      patchState(state, state => ({ ...state, ...partialState }));
    },
  })),
  withComputed(({ enabled, port, host, mouth_a_param, mouth_e_param, blendshape_modifier }) => ({
    wholeState: computed(() => ({
      enabled: enabled(),
      port: port(),
      host: host(),
      mouth_a_param: mouth_a_param(),
      mouth_e_param: mouth_e_param(),
      blendshape_modifier: blendshape_modifier(),
    })),
  })),
);