﻿import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { ChatState } from '../config/config.feature';
import { OpenAIActions } from './openai.actions';

export interface GptChatState extends ChatState {
}

export interface GptPersonalityState {
  streamersIdentity: string;
  streamerModelRelation: string;
  streamersThoughtsOnModel: string;
  modelsIdentity: string;
  modelsCoreIdentity: string;
  modelsBackground: string;
}

export interface GptSettingsState {
  apiToken: string;
  enabled: boolean;
  historyLimit: number;
  temperature: number;
  presencePenalty: number;
  frequencyPenalty: number;
  maxTokens: number;
}

export interface OpenAIState {
  chatSettings: GptChatState;
  personality: GptPersonalityState;
  settings: GptSettingsState;
}

const initialState: OpenAIState = {
  chatSettings: {
    command: '!ask',
    permissions: {
      mods: false,
      allUsers: false,
      payingMembers: false,
    },
    cooldown: 0,
    charLimit: 300,
    enabled: false,
  },
  personality: {
    modelsBackground: '',
    modelsCoreIdentity: '',
    streamersThoughtsOnModel: '',
    modelsIdentity: '',
    streamerModelRelation: '',
    streamersIdentity: '',
  },
  settings: {
    apiToken: '',
    enabled: false,
    historyLimit: 10,
    frequencyPenalty: 0,
    presencePenalty: 0,
    maxTokens: 100,
    temperature: 1,
  },
};

export const OpenAIFeature = createFeature({
  name: 'OpenAIFeature',
  reducer: createReducer(
    initialState,
    on(OpenAIActions.updateChatPermissions, (state, { permissions }) => ({
      ...state,
      chatSettings: {
        ...state.chatSettings,
        permissions: {
          ...state.chatSettings.permissions,
          ...permissions,
        },
      },
    })),
    on(OpenAIActions.updateChatSettings, (state, { chatSettings }) => ({
      ...state,
      chatSettings: {
        ...state.chatSettings,
        ...chatSettings,
      },
    })),
    on(OpenAIActions.updatePersonality, (state, { personality }) => ({
      ...state,
      personality: {
        ...state.personality,
        ...personality,
      },
    })),
    on(OpenAIActions.updateSettings, (state, { settings }) => ({
      ...state,
      settings: {
        ...state.settings,
        ...settings,
      },
    })),
    on(OpenAIActions.updateState, (state, { openAIState }) => ({
      ...state,
      ...openAIState,
    })),
  ),
  extraSelectors: ({
    selectSettings,
  }) => ({
    selectToken: createSelector(selectSettings, settings => settings.apiToken),
    selectEnabled: createSelector(selectSettings, settings => settings.enabled),
  }),
});