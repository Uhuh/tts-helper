import { TwitchChannelInfo, TwitchRedeemInfo } from './twitch.interface';

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  channelInfo: TwitchChannelInfo;
  // Twitch redeem ID
  redeem: string | null;
  redeemCharacterLimit: number;
  minBits: number;
  bitsCharacterLimit: number;
}
