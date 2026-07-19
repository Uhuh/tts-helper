import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { ConnectionStatusSnapshot } from '../models/connection-status.model';

export type SuperChat = {
  enabled: boolean;
  customMessage: string;
};

export type YoutubeFeatureState = {
  channelId: string;
  superChat: SuperChat;
};

const initialState: YoutubeFeatureState = {
  channelId: '',
  superChat: {
    enabled: false,
    customMessage: 'Thanks {username} for ${amount} superchat!',
  },
};

export const YoutubeFeature = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((state) => ({
    updateChannelId: (channelId: string) => {
      patchState(state, (state) => ({ ...state, channelId }));
    },
    updateSuperChat: (superChat: Partial<SuperChat>) => {
      patchState(state, (state) => ({ ...state, superChat: { ...state.superChat, ...superChat } }));
    },
    updateState: (partial: Partial<YoutubeFeatureState>) => {
      patchState(state, (state) => ({ ...state, ...partial }));
    },
  })),
  withComputed((state) => ({
    connectionStatus: computed((): ConnectionStatusSnapshot => {
      return {
        status: 'unknown',
        tooltip: 'YouTube status unknown',
      };
    }),
  })),
);