import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";

export type OutboundSource = {
  id: string;
  uri: string;
  body: string;
};

export type TtsHelperApiFeatureState = {
  ai_response_sources: OutboundSource[];
};

const initialState: TtsHelperApiFeatureState = {
  ai_response_sources: [],
};

export const TtsHelperApiFeature = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(state => ({
    updateState: (partial: Partial<TtsHelperApiFeatureState>) => {
      patchState(state, state => ({ ...state, ...partial }));
    },
    addResponseSource: () => {
      patchState(state, state => ({
        ...state,
        ai_response_sources: [
          ...state.ai_response_sources,
          {
            id: crypto.randomUUID(),
            uri: 'NOT SET',
            body: '{ "text": "{text}" }',
          },
        ],
      }));
    },
    updateResponseSource: (sourceId: string, partial: Partial<OutboundSource>) => {
      patchState(state, state => {
        const source = state.ai_response_sources.find((source) => source.id === sourceId);

        if (!source) {
          return state;
        }

        const copyOfSources = state.ai_response_sources.slice();
        const index = state.ai_response_sources.indexOf(source);

        copyOfSources[index] = {
          ...source,
          ...partial,
        };

        return {
          ...state,
          ai_response_sources: copyOfSources,
        };
      });
    },
    removeResponseSource: (sourceToRemoveId: string) => {
      patchState(state, state => {
        const ai_response_sources = state.ai_response_sources.filter(
          (s) => s.id !== sourceToRemoveId,
        );

        return {
          ...state,
          ai_response_sources,
        };
      });
    },
  })),
  withComputed(({ ai_response_sources }) => ({
    wholeState: computed(() => ({
      ai_response_sources: ai_response_sources(),
    })),
  })),
);