type VStreamTransactionID = `trans_${string}`;
export type VStreamChannelID = `chan_${string}`;
export type VStreamVideoID = `video_${string}`;
type VStreamEmojiID = `emoji_${string}`;
type VStreamChatID = `chat_${string}`;
type VStreamSubID = `sub_${string}`;
type VStreamMeteorShowerReceivedID = `mtr_${string}`;

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

type VStreamMeteorShowerEmoji = {
  type: 'native';
  emoji: string;
} | {
  type: 'channel';
  channelID: VStreamChannelID;
  emojiID: VStreamEmojiID;
} | {
  type: 'chanel';
  channelID: 'global';
  emojiID: VStreamEmojiID;
};

type VStreamChatBadges = [
  { type: 'global', id: 'streamer' },
  { type: 'global', id: 'moderator' },
  { type: 'global', id: 'vteam' },
  { type: 'global', id: 'partner' },
  {
    type: 'channel',
    channelID: VStreamChannelID,
    // Subscription tiers
    id: string
  },
];

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
    badges: VStreamChatBadges;
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

export type VStreamEventMeteorShower = {
  type: 'shower_received';
  timestamp: string;
  data: {
    audienceSize: number;
    createdAt: string;
    emoji: VStreamMeteorShowerEmoji;
    id: VStreamMeteorShowerReceivedID;
    receiverID: VStreamChannelID;
    receiverVideoID: VStreamVideoID;
    sender: VStreamChatter;
    senderVideo: {
      channelID: VStreamChannelID;
      contentWarning: string;
      deletedAt: null,
      description: string;
      id: VStreamVideoID;
      tags: string[];
      title: string;
      cancelledAt: null,
      endedAt: string;
      liveAt: string;
      scheduledTime: string;
      status: 'ended';
      type: 'livestream';
      vodVisibility: string;
    }
  }
};

export type VStreamEvents =
  VStreamEventUpLift
  | VStreamEventKeepAlive
  | VStreamEventChatCreated
  | VStreamEventNewFollower
  | VStreamEventSubscriptionRenew
  | VStreamEventSubscriptionGifted
  | VStreamEventMeteorShower;