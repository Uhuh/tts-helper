export type ChatPermissions = {
  allUsers: boolean,
  mods: boolean,
  payingMembers: boolean,
};

export interface ChatState {
  enabled: boolean;
  permissions: ChatPermissions;
  cooldown: number;
  charLimit: number;
  command: string;
}

export type UserPermissions = {
  isBroadcaster: boolean;
  isPayingMember: boolean;
  isMod: boolean;
};

/**
 * Generic user info for the chat command service
 */
export type ChatUserMessage = {
  displayName: string,
  text: string,
  permissions: UserPermissions;
};

export type ChatCommand = {
  enabled: boolean;
  command: string;
  // The cooldown a command has in seconds.
  cooldown: number;

  permissions: ChatPermissions;
};