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

export type RequestAudioData = {
    type: "raw";
    data: Uint8Array;
} | {
    type: "streamElements";
    text: string;
    voice: string;
};

export interface PlaybackState {
    /** End delay in milliseconds. */
    endDelay: number;
    paused: boolean;
}

export interface AudioState {
    skipped: boolean;
}
