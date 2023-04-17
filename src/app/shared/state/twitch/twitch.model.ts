import { TwitchChannelInfo, TwitchRedeemInfo } from './twitch.interface';

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  channelInfo: TwitchChannelInfo;
  selectedRedeem: TwitchRedeemInfo | null;
}
