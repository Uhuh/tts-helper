export interface TwitchChannelInfo {
  channelId: string;
  username: string;
}

export interface ValidUser {
  user_id: string;
  login: string;
  scopes: string[];
  expires_in: number;
}