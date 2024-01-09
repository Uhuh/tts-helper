import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  VStreamChannelState,
  VStreamCustomMessageState,
  VStreamSettingsState,
  VStreamState,
  VStreamTokenResponse,
  VStreamWidget,
} from './vstream.feature';
import { ChatPermissions } from '../../services/chat.interface';
import { Commands, CommandTypes } from '../../services/command.interface';

export const VStreamActions = createActionGroup({
  source: 'VStream',
  events: {
    'Update State': props<{ partialState: Partial<VStreamState> }>(),
    'Update Token': props<{ token: VStreamTokenResponse }>(),
    'Update Channel': props<{ partialChannel: Partial<VStreamChannelState> }>(),
    'Update Settings': props<{ partialSettings: Partial<VStreamSettingsState> }>(),
    'Create Widget': props<{ id: string }>(),
    'Update Widget': props<{ partialWidget: Partial<VStreamWidget> }>(),
    'Delete Widget': props<{ id: string }>(),
    'Create Chat Command': emptyProps(),
    'Create Chain Command': props<{ commandID: string, chainCommandID: string | null }>(),
    'Update Chain Command': props<{ commandID: string, chainCommandID: string, chainCommand: string | null }>(),
    'Delete Chain Command': props<{ commandID: string, chainCommandID: string }>(),
    'Delete Chat Command': props<{ commandID: string }>(),
    'Update Command Type': props<{ newType: CommandTypes, commandID: string }>(),
    'Update Command': props<{ partialCommand: Partial<Commands>, commandID: string }>(),
    'Update Chat Command Permissions': props<{ partialPermissions: Partial<ChatPermissions>, commandID: string }>(),
    'Update Up Lift': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Meteor Shower': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Renewal Subscriptions': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Gifted Subscriptions': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Update Followers': props<{ partialSettings: Partial<VStreamCustomMessageState> }>(),
    'Clear Token': emptyProps(),
  },
});