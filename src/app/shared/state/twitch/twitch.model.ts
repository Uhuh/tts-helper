import { TwitchChannelInfo } from "./twitch.interface";

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  channelInfo: TwitchChannelInfo;
}