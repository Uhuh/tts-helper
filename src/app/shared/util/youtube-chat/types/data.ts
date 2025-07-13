export interface ChatItem {
  id: string;
  author: {
    name: string
    thumbnail?: ImageItem
    channelId: string
    badge?: {
      thumbnail: ImageItem
      label: string
    }
  };
  message: MessageItem[];
  superchat?: {
    amount: string
    color: string
    sticker?: ImageItem
  };
  isMembership: boolean;
  isVerified: boolean;
  isOwner: boolean;
  isModerator: boolean;
  timestamp: Date;
}

export type MessageItem = { text: string } | EmojiItem;

export interface ImageItem {
  url: string;
  alt: string;
}

export interface EmojiItem extends ImageItem {
  emojiText: string;
  isCustomEmoji: boolean;
}

export type YoutubeId = { channelId: string } | { liveId: string } | { handle: string };
