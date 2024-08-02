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
  // This is the b64 encoded data
  data: string;
}
  | {
  type: 'streamElements' | 'tikTok';
  text: string;
  voice: string;
}
  | {
  type: 'amazonPolly';
  url?: string | null;
}
  | {
  type: 'elevenLabs';
  url: string;
  api_key: string;
  text: string;
  model_id: string;
  stability: number;
  similarity_boost: number;
};

export interface PlaybackState {
  /** End delay in milliseconds. */
  endDelay: number;
  paused: boolean;
}

export interface MonitorDevice {
  id: number;
  name: string;
}

export interface AudioState {
  skipped: boolean;
}
