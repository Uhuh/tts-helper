export type CommandPermissions = {
  allUsers: boolean;
  mods: boolean;
  payingMembers: boolean;
};

export interface ChainCommand {
  id: string;
  chainCommandID: string | null;
  chainCommandDelay: number;
}

interface BaseCommand {
  id: string;
  command: string;
  enabled: boolean;
  // The cooldown in seconds.
  cooldown: number;
  permissions: CommandPermissions;
  /**
   * If users wants to chain commands together...
   */
  chainCommands: ChainCommand[];
}

export interface ChatCommand extends BaseCommand {
  type: 'chat';
  response: string;
  autoRedeem: boolean;
  // The auto redeem interval in minutes.
  autoRedeemInterval: number;
}

export interface SoundCommand extends BaseCommand {
  type: 'sound';
  // The B64 file path to the sound.
  fileURL: string;
}

export interface ChoiceCommand extends BaseCommand {
  type: 'choice';
  /**
   * These should just be any number of options the user.
   * @TODO - Should options have weighted chance?
   */
  options: string[];
  response: string;
}

export interface CounterCommand extends BaseCommand {
  type: 'counter';
  // The amount to increment the value by each time the command is run.
  amount: number;
  // The current value of the counter;
  value: number;
  // Whether to reset the value when TTS Helper is launched.
  resetOnLaunch: boolean;
  response: string;
}

/**
 * Maybe this can be how users can trigger events in VTS.
 * Might require a point system.
 */
export interface VTubeStudioCommand extends BaseCommand {
  type: 'vts';
  /**
   * This might be the event name in VTS to trigger.
   */
  event: string;
}

export const initialBaseCommand: Omit<BaseCommand, 'id'> = {
  cooldown: 0,
  enabled: true,
  command: '!command',
  permissions: {
    allUsers: true,
    payingMembers: false,
    mods: false,
  },
  chainCommands: [],
};

export const initialChoiceCommand: Omit<ChoiceCommand, 'id'> = {
  type: 'choice',
  ...initialBaseCommand,
  command: '!choice',
  response: '',
  options: [],
};

export const initialChatCommand: Omit<ChatCommand, 'id'> = {
  type: 'chat',
  ...initialBaseCommand,
  command: '!chat',
  autoRedeemInterval: 0,
  autoRedeem: false,
  response: 'Change me!',
};

export const initialSoundCommand: Omit<SoundCommand, 'id'> = {
  type: 'sound',
  ...initialBaseCommand,
  command: '!sound',
  fileURL: '',
};

export const initialCounterCommand: Omit<CounterCommand, 'id'> = {
  type: 'counter',
  ...initialBaseCommand,
  command: `!counter`,
  response: `I've counted {value} times!`,
  amount: 1,
  value: 0,
  resetOnLaunch: false,
};

export type Commands = ChatCommand | SoundCommand | ChoiceCommand | CounterCommand;

type ExtractCommandTypes<T> = T extends { type: infer U } ? U : never;
export type CommandTypes = ExtractCommandTypes<Commands>;