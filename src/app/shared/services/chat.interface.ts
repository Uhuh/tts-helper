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

export type WatchStreakUser = {
  id: string;
  displayName: string;
  isSubscriber: boolean;
};

export type ChatCommand = {
  // UUID
  id: string;
  command: string;
  response: string;
  enabled: boolean;
  autoRedeem: boolean;
  // The auto redeem interval in minutes.
  autoRedeemInterval: number;
  // The cooldown a command has in seconds.
  cooldown: number;

  permissions: ChatPermissions;
};