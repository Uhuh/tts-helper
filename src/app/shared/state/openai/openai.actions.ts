﻿import { createActionGroup, props } from '@ngrx/store';
import { GptChatState, GptPersonalityState, GptSettingsState, GptVisionState, OpenAIState } from './openai.feature';
import { ChatPermissions } from '../../services/chat.interface';

export const OpenAIActions = createActionGroup({
  source: 'OpenAI',
  events: {
    'Update Chat Permissions': props<{ permissions: Partial<ChatPermissions> }>(),
    'Update Chat Settings': props<{ chatSettings: Partial<GptChatState> }>(),
    'Update Personality': props<{ personality: Partial<GptPersonalityState> }>(),
    'Update Settings': props<{ settings: Partial<GptSettingsState> }>(),
    'Update Vision': props<{ settings: Partial<GptVisionState> }>(),
    'Update State': props<{ openAIState: OpenAIState }>(),
  },
});