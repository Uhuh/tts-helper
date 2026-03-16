import { createFeature, createReducer, on } from '@ngrx/store';
import { VTubeStudioActions } from './vtubestudio.actions';
import { uuidv4 } from 'uuidv7';
import { klona } from 'klona';

export interface EmoteToExpression {
  id: string;
  emotePattern: string;
  expressionName: string;
  isRegex: boolean;
  // 0 = toggle once, >0 = toggle on then auto-toggle off after duration
  toggleDurationMs: number;
  // Whether to filter this word out of TTS or not (default: true)
  shouldFilter: boolean;
}

export interface VTubeStudioState {
  port: number;
  isMirrorMouthFormEnabled: boolean;
  isMirrorMouthOpenEnabled: boolean;
  emoteToExpressions: EmoteToExpression[];
}

const initalState: VTubeStudioState = {
  isMirrorMouthFormEnabled: false,
  isMirrorMouthOpenEnabled: false,
  port: 8001, // This is VTS' default
  emoteToExpressions: [],
};

export const VTubeStudioFeature = createFeature({
  name: 'VTubeStudioFeature',
  reducer: createReducer(
    initalState,
    on(VTubeStudioActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
    on(VTubeStudioActions.createEmoteToExpression, (state, { partialSettings }) => ({
      ...state,
      emoteToExpressions: [
        ...state.emoteToExpressions,
        {
          id: uuidv4(),
          emotePattern: '',
          expressionName: '',
          isRegex: false,
          toggleDurationMs: 0,
          shouldFilter: true,
          ...partialSettings,
        } satisfies EmoteToExpression,
      ],
    })),
    on(VTubeStudioActions.updateEmoteToExpression, (state, { id, partialSettings }) => {
      const emoteToExpression = state.emoteToExpressions.find(e => e.id === id);

      if (!emoteToExpression) {
        return state;
      }

      const copiedEmoteToExpressions = klona(state.emoteToExpressions);
      const index = state.emoteToExpressions.indexOf(emoteToExpression);

      copiedEmoteToExpressions[index] = {
        ...emoteToExpression,
        ...partialSettings,
      };

      return {
        ...state,
        emoteToExpressions: copiedEmoteToExpressions,
      };
    }),
    on(VTubeStudioActions.deleteEmoteToExpression, (state, { id }) => {
      const emoteToExpression = state.emoteToExpressions.find(e => e.id === id);

      if (!emoteToExpression) {
        return state;
      }

      const copiedEmoteToExpressions = klona(state.emoteToExpressions);
      const index = state.emoteToExpressions.indexOf(emoteToExpression);

      copiedEmoteToExpressions.splice(index, 1);

      return {
        ...state,
        emoteToExpressions: copiedEmoteToExpressions,
      };
    }),
  ),
});