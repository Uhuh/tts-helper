﻿export interface TwitchRedeemInfo {
  id: string;
  title: string;
  cost: number;
  prompt: string;
}

export interface TwitchChannelInfo {
  channelId: string;
  username: string;
  redeems: TwitchRedeemInfo[];
}

export interface ValidUser {
  user_id: string;
  login: string;
  scopes: string[];
  expires_in: number;
}
