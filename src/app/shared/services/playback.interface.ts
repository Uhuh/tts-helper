export type AudioId = number;
export type DeviceId = number;
export type WithId<T, Id> = T & { id: Id };

export interface DeviceInfo {
  name: string;
  isDefault: boolean;
}

export interface OutputDeviceList {
  outputDevices: WithId<DeviceInfo, DeviceId>[];
}

export interface PlayAudioRequest {
  data: RequestAudioData;
}

export type RequestAudioData =
  | {
      type: 'raw';
      data: Uint8Array;
    }
  | {
      type: 'streamElements' | 'tikTok';
      text: string;
      voice: string;
    }
  | {
      type: 'amazonPolly';
      url?: string | null;
    };

export interface PlaybackState {
  /** End delay in milliseconds. */
  endDelay: number;
  paused: boolean;
}

export interface AudioState {
  skipped: boolean;
}
