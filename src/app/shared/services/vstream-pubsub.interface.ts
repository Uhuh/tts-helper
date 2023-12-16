type VStreamTransactionID = `trans_${string}`;
type VStreamChannelID = `chan_${string}`;
type VStreamVideoID = `video_${string}`;
type VStreamEmojiID = `emoji_${string}`;
type VStreamChatID = `chat_${string}`;
type VStreamSubID = `sub_${string}`;

type VStreamChatter = {
  displayName: string;
  id: VStreamChannelID;
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
  id: VStreamEmojiID;
  channelID: VStreamChannelID | null;
};

type VStreamMentionNode = {
  type: 'mention';
  channelID: VStreamChannelID;
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
    chatterChannelID: VStreamChannelID;
    color: `#${string}`;
    createdAt: string;
    id: VStreamChatID;
    nodes: VStreamNodes;
    text: string;
    videoChannelID: VStreamChannelID;
    videoID: VStreamVideoID;
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
    channelID: VStreamChannelID;
    id: VStreamTransactionID;
    isAnonymous: boolean;
    message: {
      nodes: VStreamNodes;
      text: string;
    };
    level: number;
    score: number;
    sender: VStreamChatter;
    videoID: VStreamVideoID;
  };
};

export type VStreamEventSubscriptionRenew = {
  type: 'subscription_renewed';
  timestamp: string;
  data: {
    amount: VSteamAmount;
    channelID: VStreamChannelID;
    id: VStreamTransactionID;
    message: {
      nodes: VStreamNodes;
      text: string;
    } | null;
    renewalMonth: number;
    tier: number;
    score: number;
    streakMonth: number;
    subscriber: VStreamChatter;
    subscriptionID: VStreamSubID;
  };
};

export type VStreamEventSubscriptionGifted = {
  type: 'subscriptions_gifted';
  timestamp: string;
  data: {
    channelID: VStreamChannelID;
    id: VStreamTransactionID;
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