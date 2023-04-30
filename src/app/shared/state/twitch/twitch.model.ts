import { TwitchChannelInfo } from './twitch.interface';

export interface TwitchRedeemState {
  enabled: boolean;
  redeem: string | null;
  redeemCharacterLimit: number;
}

export interface TwitchBitState {
  enabled: boolean;
  exact: boolean;
  minBits: number;
  bitsCharacterLimit: number;
}

export interface TwitchSubState {
  enabled: boolean;
  giftMessage: string;
  subCharacterLimit: number;
}

export interface TwitchState {
  token: string | null;
  isTokenValid: boolean;
  subsInfo: TwitchSubState;
  channelInfo: TwitchChannelInfo;
  bitInfo: TwitchBitState;
  redeemInfo: TwitchRedeemState;
}
