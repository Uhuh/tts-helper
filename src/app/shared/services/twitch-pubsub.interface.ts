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
  userId: string;
  userDisplayName: string;
  userName: string;
}
