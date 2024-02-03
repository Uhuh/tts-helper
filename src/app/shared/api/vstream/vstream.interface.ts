import { VStreamChannelID, VStreamVideoID } from '../../services/vstream-pubsub.interface';

export type VStreamAPIChannelVideoLiveStream = {
  type: 'livestream';
  id: VStreamVideoID;
};

export type VStreamAPILivestreamVideo = {
  id: VStreamVideoID;
  channelID: VStreamChannelID;
  contentWarning: string;
  deletedAt: null;
  description: string | null;
  isClippingEnabled: boolean;
  tags: string[];
  title: string;
  url: string; // URL to Livestream
  cancelledAt: null;
  endedAt: null;
  liveAt: string;
  scheduledTime: string;
  status: 'live';
  type: 'livestream';
  vodVisibility: string; // public?
};