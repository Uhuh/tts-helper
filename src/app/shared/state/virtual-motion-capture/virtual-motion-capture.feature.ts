import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from "@angular/core";

export type BlendShape = {
  id: string;
  mouthOpen: number;
  mouthForm: number;
};

export type VirtualMotionCaptureState = {
  enabled: boolean;
  port: number;
  host: string;
  blendShapes: BlendShape[];
};

const initialState: VirtualMotionCaptureState = {
  enabled: false,
  port: 39539,
  host: '127.0.0.1',
  blendShapes: [],
};

export const VirtualMotionCaptureFeature = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(state => ({
    updateState: (partialState: Partial<VirtualMotionCaptureState>) => {
      patchState(state, state => ({ ...state, ...partialState }));
    },
  })),
  withComputed(({ enabled, port, host, blendShapes }) => ({
    wholeState: computed(() => ({
      enabled: enabled(),
      port: port(),
      host: host(),
      blendShapes: blendShapes(),
    })),
  })),
);