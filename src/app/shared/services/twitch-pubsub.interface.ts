export interface TwitchRedeem {
  broadcasterDisplayName: string;
  broadcasterId: string;
  broadcasterName: string;
  id: string;
  input: string;
  redemptionDate: Date;
  rewardCost: number;
  rewardId: string;
  rewardPrompt: string;
  rewardTitle: string;
  status: string;
  userDisplayName: string;
  userId: string;
  userName: string;
}

export interface TwitchCheer {
  bits: number;
  broadcasterId: string;
  broadcasterDisplayName: string;
  broadcasterName: string;
  isAnonymous: boolean;
  message: string;
  userId: string | null;
  userName: string | null;
  userDisplayName: string | null;
}

export interface TwitchSub {
  broadcasterDisplayName: string;
  broadcasterName: string;
  broadcasterId: string;
  isGift?: boolean;
  tier: string;
  userDisplayName: string;
  userId: string;
  userName: string;
}

export interface TwitchGiftSub {
  broadcasterDisplayName: string;
  broadcasterId: string;
  broadcasterName: string;
  cumulativeAmount: number | null;
  amount: number;
  gifterId: string;
  gifterName: string;
  gifterDisplayName: string;
  isAnonymous: boolean;
  tier: string;
}

export interface TwitchSubMessage {
  broadcasterDisplayName: string;
  broadcasterId: string;
  broadcasterName: string;
  cumulativeMonths: number;
  streakMonths: number | null;
  durationMonths: number;
  tier: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  messageText: string;
}
