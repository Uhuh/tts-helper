import { TwitchChannelInfo } from './twitch.interface';

export interface TwitchRedeemState {
  enabled: boolean;
  redeem: string | null;
  redeemCharacterLimit: number;
}

export interface TwitchBitState {
  enabled: boolean;
  minBits: number;
  bitsCharacterLimit: number;
}

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  channelInfo: TwitchChannelInfo;
  bitInfo: TwitchBitState;
  redeemInfo: TwitchRedeemState;
}
