import { VStreamVideoID } from '../../services/vstream-pubsub.interface';

export type VStreamAPIChannelVideoLiveStream = {
  type: 'livestream';
  id: VStreamVideoID;
};
