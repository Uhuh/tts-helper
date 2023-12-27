import { createFeature, createReducer, on } from '@ngrx/store';
import { VStreamActions } from './vstream.actions';
import { VStreamChannelID, VStreamEvents } from '../../services/vstream-pubsub.interface';
import { ChatCommand } from '../../services/chat.interface';

export type VStreamTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
};

export type VStreamToken = {
  expireDate: number;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
};

export type VStreamSettingsState = {
  randomChance: number;
};

export type VStreamChannelState = {
  username: string;
  channelId: VStreamChannelID;
  pictureUrl: string;
  channelUrl: string;
};

export type VStreamCustomMessageState = {
  enabled: boolean;
  enabledGpt: boolean;
  enabledChat: boolean;
  customMessage: string;
};

export type VStreamSubscriptionSettingsState = {
  renew: VStreamCustomMessageState;
  gifted: VStreamCustomMessageState;
};

type ExtractEventTypes<T> = T extends { type: infer U } ? U : never;
export type VStreamEventTypes = ExtractEventTypes<VStreamEvents>;

export type VStreamWidget = {
  id: string;
  trigger: VStreamEventTypes;
  customMessage: string | null;
  // This will be the b64 encoded URL
  fileURL: string | null;
  soundPath: string | null;
  width: number;
  height: number;
  yPosition: number;
  xPosition: number;
  fadeInDuration: number;
  fadeOutDuration: number;
};

export type VStreamState = {
  token: VStreamToken;
  chatCommands: ChatCommand[];
  widgets: VStreamWidget[];
  channelInfo: VStreamChannelState;
  settings: VStreamSettingsState;
  uplift: VStreamCustomMessageState;
  meteorShower: VStreamCustomMessageState;
  subscriptions: VStreamSubscriptionSettingsState;
  followers: VStreamCustomMessageState;
};

const initialCustomMessage: VStreamCustomMessageState = {
  customMessage: '',
  enabledGpt: false,
  enabled: false,
  enabledChat: false,
};

const initialChatCommand: Omit<ChatCommand, 'id'> = {
  command: '!command',
  permissions: {
    allUsers: true,
    payingMembers: false,
    mods: false,
  },
  autoRedeemInterval: 0,
  autoRedeem: false,
  cooldown: 0,
  enabled: true,
  response: 'Change me!',
};

const initialState: VStreamState = {
  chatCommands: [],
  widgets: [],
  token: {
    accessToken: '',
    idToken: '',
    refreshToken: '',
    expireDate: -1,
    expiresIn: -1,
  },
  channelInfo: {
    username: '',
    channelId: 'chan_',
    pictureUrl: '',
    channelUrl: '',
  },
  settings: {
    randomChance: 0,
  },
  uplift: {
    ...initialCustomMessage,
    customMessage: 'Thanks {username} for the {formatted} UpLift!',
  },
  meteorShower: {
    ...initialCustomMessage,
    customMessage: 'Thanks {username} for the {size} person meteor shower!',
  },
  subscriptions: {
    renew: {
      ...initialCustomMessage,
      customMessage: 'Thanks {username} for subscribing for {renewalMonth} months!',
    },
    gifted: {
      ...initialCustomMessage,
      customMessage: 'Thanks {gifter} for gifting {amount} tier {tier} subs!',
    },
  },
  followers: {
    ...initialCustomMessage,
    customMessage: 'Thanks {username} for following!',
  },
};

export const VStreamFeature = createFeature({
  name: 'VStreamFeature',
  reducer: createReducer(
    initialState,
    on(VStreamActions.updateState, (state, { partialState }) => ({
      ...state,
      ...partialState,
    })),
    on(VStreamActions.updateChannel, (state, { partialChannel }) => ({
      ...state,
      channelInfo: {
        ...state.channelInfo,
        ...partialChannel,
      },
    })),
    on(VStreamActions.updateSettings, (state, { partialSettings }) => ({
      ...state,
      settings: {
        ...state.settings,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateUpLift, (state, { partialSettings }) => ({
      ...state,
      uplift: {
        ...state.uplift,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateMeteorShower, (state, { partialSettings }) => ({
      ...state,
      meteorShower: {
        ...state.meteorShower,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateRenewalSubscriptions, (state, { partialSettings }) => ({
      ...state,
      subscriptions: {
        ...state.subscriptions,
        renew: {
          ...state.subscriptions.renew,
          ...partialSettings,
        },
      },
    })),
    on(VStreamActions.updateGiftedSubscriptions, (state, { partialSettings }) => ({
      ...state,
      subscriptions: {
        ...state.subscriptions,
        gifted: {
          ...state.subscriptions.gifted,
          ...partialSettings,
        },
      },
    })),
    on(VStreamActions.updateFollowers, (state, { partialSettings }) => ({
      ...state,
      followers: {
        ...state.followers,
        ...partialSettings,
      },
    })),
    on(VStreamActions.updateToken, (state, { token }) => ({
      ...state,
      token: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expireDate: Date.now() + token.expires_in * 1000,
        idToken: token.id_token,
        expiresIn: token.expires_in,
      },
    })),
    on(VStreamActions.createWidget, (state, { widget }) => ({
      ...state,
      widgets: [
        ...state.widgets,
        widget,
      ],
    })),
    on(VStreamActions.updateWidget, (state, { widget }) => {
      const existingWidget = state.widgets.find(w => w.id === widget.id);

      if (!existingWidget) {
        return state;
      }

      const copyOfWidgets = state.widgets.slice();
      const index = state.widgets.indexOf(existingWidget);

      copyOfWidgets[index] = {
        ...widget,
      };

      return {
        ...state,
        widgets: copyOfWidgets,
      };
    }),
    on(VStreamActions.createChatCommand, (state) => ({
      ...state,
      chatCommands: [
        ...state.chatCommands,
        {
          id: crypto.randomUUID(),
          ...initialChatCommand,
        },
      ],
    })),
    on(VStreamActions.deleteChatCommand, (state, { commandID }) => {
      const command = state.chatCommands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.chatCommands.slice();
      const index = state.chatCommands.indexOf(command);

      copyOfCommands.splice(index, 1);

      return {
        ...state,
        chatCommands: copyOfCommands,
      };
    }),
    on(VStreamActions.updateChatCommand, (state, { partialCommand, commandID }) => {
      const command = state.chatCommands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.chatCommands.slice();
      const index = state.chatCommands.indexOf(command);

      copyOfCommands[index] = {
        ...command,
        ...partialCommand,
      };

      return {
        ...state,
        chatCommands: copyOfCommands,
      };
    }),
    on(VStreamActions.updateChatCommandPermissions, (state, { partialPermissions, commandID }) => {
      const command = state.chatCommands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.chatCommands.slice();
      const index = state.chatCommands.indexOf(command);

      copyOfCommands[index] = {
        ...command,
        permissions: {
          ...command.permissions,
          ...partialPermissions,
        },
      };

      return {
        ...state,
        chatCommands: copyOfCommands,
      };
    }),
    on(VStreamActions.clearToken, (state) => ({
      ...state,
      token: {
        ...initialState.token,
      },
    })),
  ),
});