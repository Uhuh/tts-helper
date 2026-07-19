import { createActionGroup, createFeature, createReducer, emptyProps, on, props } from '@ngrx/store';

export type ConnectionKind =
  | 'twitch'
  | 'youtube'
  | 'vtubestudio'
  | 'vmc'
  | 'kick'
  | 'picarto'
  | 'tiktok';

export type ConnectionStatus =
  | 'connected'
  | 'partial'
  | 'disconnected'
  | 'unknown';

export interface ConnectionConfig {
  kind: ConnectionKind;
  name: string;
  route: string;
  icon: string;
}

export const CONNECTION_REGISTRY: Record<Exclude<ConnectionKind, 'kick' | 'tiktok' | 'picarto'>, ConnectionConfig> = {
  twitch: {
    kind: 'twitch',
    name: 'Twitch',
    route: 'twitch',
    icon: 'assets/twitch.svg',
  },
  youtube: {
    kind: 'youtube',
    name: 'YouTube',
    route: 'youtube',
    icon: 'assets/youtube.svg',
  },
  vtubestudio: {
    kind: 'vtubestudio',
    name: 'VTubeStudio',
    route: 'vtubestudio',
    icon: 'assets/vts_logo_transparent.png',
  },
  vmc: {
    kind: 'vmc',
    name: 'VMC Protocol',
    route: 'virtual-motion-capture',
    icon: 'assets/virtual-motion-capture.png',
  },
};

export interface AppSettingsFeatureState {
  connectionsExpanded: boolean;
  connections: Record<ConnectionKind, boolean>;
}

export const AppSettingsActions = createActionGroup({
  source: 'AppSettings',
  events: {
    'Update State': props<{ partialState: Partial<AppSettingsFeatureState> }>(),
    'Update Connections': props<{ partialConnections: Partial<AppSettingsFeatureState['connections']> }>(),
    'Toggle Connections Expanded': emptyProps(),
  },
});

export const initialState: AppSettingsFeatureState = {
  connectionsExpanded: true,
  connections: {
    twitch: true,
    youtube: true,
    vtubestudio: true,
    vmc: true,
    kick: false,
    picarto: false,
    tiktok: false,
  },
};

export const AppSettingsFeature = createFeature({
  name: 'AppSettings',
  reducer: createReducer(
    initialState,
    on(AppSettingsActions.toggleConnectionsExpanded, (state) => ({
      ...state,
      connectionsExpanded: !state.connectionsExpanded,
    })),
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