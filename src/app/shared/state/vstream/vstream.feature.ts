import { createFeature, createReducer, on } from '@ngrx/store';
import { VStreamActions } from './vstream.actions';
import { VStreamChannelID, VStreamEvents } from '../../services/vstream-pubsub.interface';
import {
  ChatCommand,
  Commands,
  CommandTypes,
  initialChatCommand,
  initialChoiceCommand,
  initialCounterCommand,
  initialSoundCommand,
} from '../../services/command.interface';

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
  enabled: boolean;
  trigger: VStreamEventTypes;
  duration: number;
  customMessage: string | null;
  // This will be the b64 encoded URL
  fileURL: string | null;
  soundPath: string | null;
  fontPosition: string | null;
  fontColor: string | null;
  fontSize: number;
  width: number;
  height: number;
  yPosition: number;
  xPosition: number;
  fadeInDuration: number;
  fadeOutDuration: number;
};

const initialWidget: VStreamWidget = {
  id: '',
  enabled: true,
  trigger: 'new_follower',
  duration: 5,
  customMessage: null,
  fileURL: null,
  soundPath: null,
  fontPosition: null,
  fontColor: null,
  fontSize: 20,
  width: 300,
  height: 300,
  yPosition: 300,
  xPosition: 300,
  fadeInDuration: 300,
  fadeOutDuration: 300,
};

export type VStreamState = {
  token: VStreamToken;
  chatCommands: ChatCommand[];
  commands: Commands[];
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

/**
 * Return a default state command for the passed in type.
 * @param type
 */
function changeCommandType(type: CommandTypes) {
  switch (type) {
    case 'counter':
      return initialCounterCommand;
    case 'sound':
      return initialSoundCommand;
    case 'choice':
      return initialChoiceCommand;
    case 'chat':
    default:
      return initialChatCommand;
  }
}

const initialState: VStreamState = {
  chatCommands: [],
  commands: [],
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
    on(VStreamActions.createWidget, (state, { id }) => ({
      ...state,
      widgets: [
        ...state.widgets,
        {
          ...initialWidget,
          id,
        },
      ],
    })),
    on(VStreamActions.updateWidget, (state, { partialWidget }) => {
      const existingWidget = state.widgets.find(w => w.id === partialWidget.id);

      if (!existingWidget) {
        return state;
      }

      const copyOfWidgets = state.widgets.slice();
      const index = state.widgets.indexOf(existingWidget);

      copyOfWidgets[index] = {
        ...existingWidget,
        ...partialWidget,
      };

      return {
        ...state,
        widgets: copyOfWidgets,
      };
    }),
    on(VStreamActions.deleteWidget, (state, { id }) => {
      const widget = state.widgets.find(w => w.id === id);

      if (!widget) {
        return state;
      }

      const copyOfWidgets = state.widgets.slice();
      const index = state.widgets.indexOf(widget);

      copyOfWidgets.splice(index, 1);

      return {
        ...state,
        widgets: copyOfWidgets,
      };
    }),
    on(VStreamActions.createChatCommand, (state) => ({
      ...state,
      commands: [
        ...state.commands,
        {
          id: crypto.randomUUID(),
          ...initialChatCommand,
        },
      ],
    })),
    on(VStreamActions.migrateChatCommand, (state, { chatCommand }) => ({
      ...state,
      commands: [
        ...state.commands,
        {
          ...chatCommand,
          type: 'chat',
          chainCommands: [],
        } as ChatCommand,
      ],
    })),
    on(VStreamActions.removeOldChatCommands, (state) => ({
      ...state,
      chatCommands: [],
    })),
    on(VStreamActions.createChainCommand, (state, { commandID, chainCommandID }) => {
      const command = state.commands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.commands.slice();
      const index = state.commands.indexOf(command);
      const id = crypto.randomUUID();

      copyOfCommands[index] = {
        ...command,
        chainCommands: [
          ...command.chainCommands ?? [], {
            id,
            chainCommandID,
            chainCommandDelay: 0,
          },
        ],
      };

      return {
        ...state,
        commands: copyOfCommands,
      };
    }),
    on(VStreamActions.updateChainCommand, (state, { commandID, chainCommandID, chainCommand }) => {
      const command = state.commands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.commands.slice();
      const commandIndex = state.commands.indexOf(command);
      const chainCommands = copyOfCommands[commandIndex].chainCommands.slice();

      const chainCommandToUpdate = chainCommands.find(c => c.id === chainCommandID);

      if (!chainCommandToUpdate) {
        return state;
      }

      const chainCommandIndex = chainCommands.indexOf(chainCommandToUpdate);

      chainCommands[chainCommandIndex] = {
        ...chainCommands[chainCommandIndex],
        chainCommandID: chainCommand,
      };

      copyOfCommands[commandIndex] = {
        ...command,
        chainCommands,
      };

      return {
        ...state,
        commands: copyOfCommands,
      };
    }),
    on(VStreamActions.deleteChainCommand, (state, { commandID, chainCommandID }) => {
      const command = state.commands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.commands.slice();
      const commandIndex = state.commands.indexOf(command);
      const chainCommands = copyOfCommands[commandIndex].chainCommands.slice();

      const chainCommand = chainCommands.find(c => c.id === chainCommandID);

      if (!chainCommand) {
        return state;
      }

      const chainCommandIndex = copyOfCommands[commandIndex].chainCommands.indexOf(chainCommand);

      chainCommands.splice(chainCommandIndex, 1);

      copyOfCommands[commandIndex] = {
        ...command,
        chainCommands,
      };

      return {
        ...state,
        commands: copyOfCommands,
      };
    }),
    on(VStreamActions.updateCommandType, (state, { newType, commandID }) => {
      const command = state.commands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.commands.slice();
      const index = state.commands.indexOf(command);

      copyOfCommands[index] = {
        id: command.id,
        ...changeCommandType(newType),
      };

      return {
        ...state,
        commands: copyOfCommands,
      };
    }),
    on(VStreamActions.deleteChatCommand, (state, { commandID }) => {
      const command = state.commands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.commands.slice();
      const index = state.commands.indexOf(command);

      copyOfCommands.splice(index, 1);

      return {
        ...state,
        commands: copyOfCommands,
      };
    }),
    on(VStreamActions.updateCommand, (state, { partialCommand, commandID }) => {
      const command = state.commands.find(c => c.id === commandID);

      if (!command || partialCommand.type !== command.type) {
        return state;
      }

      const copyOfCommands = state.commands.slice();
      const index = state.commands.indexOf(command);

      copyOfCommands[index] = {
        ...command,
        ...partialCommand,
      } as Commands;

      return {
        ...state,
        commands: copyOfCommands,
      };
    }),
    on(VStreamActions.updateChatCommandPermissions, (state, { partialPermissions, commandID }) => {
      const command = state.commands.find(c => c.id === commandID);

      if (!command) {
        return state;
      }

      const copyOfCommands = state.commands.slice();
      const index = state.commands.indexOf(command);

      copyOfCommands[index] = {
        ...command,
        permissions: {
          ...command.permissions,
          ...partialPermissions,
        },
      };

      return {
        ...state,
        commands: copyOfCommands,
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