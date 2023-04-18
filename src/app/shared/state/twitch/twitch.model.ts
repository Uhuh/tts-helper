import { TwitchChannelInfo, TwitchRedeemInfo } from './twitch.interface';

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  channelInfo: TwitchChannelInfo;
  redeem: TwitchRedeemInfo | null;
  redeemCharacterLimit: number;
}
