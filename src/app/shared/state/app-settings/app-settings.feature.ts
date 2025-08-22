import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';

export interface AppSettingsFeatureState {
  connections: {
    vstreamEnabled: boolean,
    youtubeEnabled: boolean,
    twitchEnabled: boolean,
    vtubestudioEnabled: boolean,
    vmcEnabled: boolean,
  };
}

export const AppSettingsActions = createActionGroup({
  source: 'AppSettings',
  events: {
    'Update State': props<{ partialState: Partial<AppSettingsFeatureState> }>(),
    'Update Connections': props<{ partialConnections: Partial<AppSettingsFeatureState['connections']> }>(),
  },
});

export const initialState: AppSettingsFeatureState = {
  connections: {
    vstreamEnabled: true,
    youtubeEnabled: true,
    twitchEnabled: true,
    vtubestudioEnabled: true,
    vmcEnabled: true,
  },
};

export const AppSettingsFeature = createFeature({
  name: 'AppSettings',
  reducer: createReducer(
    initialState,
    on(AppSettingsActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
    on(AppSettingsActions.updateConnections, (state, { partialConnections }) => ({
      ...state,
      connections: {
        ...state.connections,
        ...partialConnections,
      },
    })),
  ),
});