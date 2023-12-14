/**
 * Generic user info for the chat command service
 */
export type ChatUserMessage = {
  displayName: string,
  text: string,
  isBroadcaster: boolean,
  isPayingMember: boolean,
  isMod: boolean
};