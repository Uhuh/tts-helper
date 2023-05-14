import { Injectable } from "@angular/core";
import { invoke } from "@tauri-apps/api";

type AudioId = number;
type DeviceId = number;
type WithId<T, Id> = T & { id: Id };

interface DeviceInfo {
    name: string;
    isDefault: boolean;
}

interface OutputDeviceList {
    outputDevices: WithId<DeviceInfo, DeviceId>[];
}

interface PlayAudioRequest {
    deviceId: DeviceId;
    data: RequestAudioData;
}

type RequestAudioData = {
    type: "raw";
    data: Uint8Array;
};

interface PlaybackState {
    /** End delay in milliseconds. */
    endDelay: number;
    paused: boolean;
}

interface AudioState {
    skipped: boolean;
}

@Injectable()
export class PlaybackService {
    /**
     * Gets a list of the available output devices.
     * @returns A list of the available output devices.
     */
    async listOutputDevices(): Promise<OutputDeviceList> {
        const devices = await invoke("plugin:playback|list_output_devices");
        return devices as OutputDeviceList;
    }

    /**
     * Sets the output device to use for playback.
     * @param deviceId The ID of the device to use.
     */
    async setOutputDevice(deviceId: DeviceId): Promise<void> {
        await invoke("plugin:playback|set_output_device", { deviceId });
    }

    /**
     * Plays the given audio data.
     * @param request The audio data to play.
     */
    async playAudio(request: PlayAudioRequest): Promise<void> {
        await invoke("plugin:playback|play_audio", { request });
    }

    /**
     * Sets the playback state.
     * @param state The playback state to set.
     */
    async setPlaybackState(state: Partial<PlaybackState>): Promise<void> {
        await invoke("plugin:playback|set_playback_state", { state });
    }

    /**
     * Gets the current playback state.
     * @returns The current playback state.
     */
    async setAudioState(state: WithId<Partial<AudioState>, AudioId>): Promise<void> {
        await invoke("plugin:playback|set_audio_state", { state });
    }

    /**
     * Lists the audio sources that are either playing or queued.
     * @returns The IDs of the audio sources that are either playing or queued.
     */
    async listAudio(): Promise<AudioId[]> {
        const audio = await invoke("plugin:playback|list_audio");
        return audio as AudioId[];
    }
}
