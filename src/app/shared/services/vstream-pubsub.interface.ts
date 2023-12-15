type VStreamChannelId = `chan_${string}`;

type VStreamChatter = {
  displayName: string;
  id: VStreamChannelId;
  status: 'active' | string;
  username: string;
};

type VSteamAmount = {
  amount: number;
  currency: string;
  formatted: string;
};

type VStreamTextNode = {
  type: 'text';
  text: string;
};

type VStreamEmojiNode = {
  type: 'emoji';
  originalActionText: string;
  id: `emoji_${string}`;
  channelID: VStreamChannelId | null;
};

type VStreamMentionNode = {
  type: 'mention';
  channelID: VStreamChannelId;
  originalUsername: string;
};

type VStreamLinkNode = {
  type: 'link';
  href: string;
  nodes: VStreamTextNode[];
};

export type VStreamNodes = (
  VStreamTextNode
  | VStreamEmojiNode
  | VStreamMentionNode
  | VStreamLinkNode
  )[];


/**
 * Relevant event types below.
 */

export type VStreamEventKeepAlive = {
  type: 'keep_alive';
  data: unknown;
};

export type VStreamEventChatCreated = {
  type: 'chat_created';
  timestamp: string;
  data: {
    chatterChannelID: VStreamChannelId;
    color: `#${string}`;
    createdAt: string;
    id: `chat_${string}`;
    nodes: VStreamNodes;
    text: string;
    videoChannelID: VStreamChannelId;
    videoID: `video_${string}`;
    chatter: VStreamChatter;
  };
};

export type VStreamEventNewFollower = {
  type: 'new_follower';
  timestamp: string;
  data: VStreamChatter;
};

export type VStreamEventUpLift = {
  type: 'uplifting_chat_sent';
  timestamp: string;
  data: {
    amount: VSteamAmount;
    channelID: VStreamChannelId;
    id: `trans_${string}`;
    isAnonymous: boolean;
    message: {
      nodes: VStreamNodes;
      text: string;
    };
    level: number;
    score: number;
    sender: VStreamChatter;
    videoID: `video_${string}`;
  };
};

export type VStreamEventSubscriptionRenew = {
  type: 'subscription_renewed';
  timestamp: string;
  data: {
    amount: VSteamAmount;
    channelID: VStreamChannelId;
    id: `trans_${string}`;
    message: {
      nodes: VStreamNodes;
      text: string;
    };
    renewalMonth: number;
    tier: number;
    score: number;
    streakMonth: number;
    subscriber: VStreamChatter;
    subscriptionID: `sub_${string}`;
  };
};

export type VStreamEventSubscriptionGifted = {
  type: 'subscriptions_gifted';
  timestamp: string;
  data: {
    channelID: VStreamChannelId;
    id: `trans_${string}`;
    gifter: VStreamChatter;
    tier: number;
    subscribers: VStreamChatter[];
  }
};

export type VStreamEvents =
  VStreamEventUpLift
  | VStreamEventKeepAlive
  | VStreamEventChatCreated
  | VStreamEventNewFollower
  | VStreamEventSubscriptionRenew
  | VStreamEventSubscriptionGifted;