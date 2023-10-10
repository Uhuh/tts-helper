import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { Subject, from, tap, BehaviorSubject } from 'rxjs';
import {
  AudioId,
  AudioState,
  DeviceId,
  OutputDeviceList,
  PlayAudioRequest,
  PlaybackState,
  WithId,
} from './playback.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class PlaybackService {
  /**
   * Emits when an audio source starts playing.
   */
  readonly audioStarted$ = new Subject<AudioId>();

  /**
   * Emits when an audio source finishes playing.
   */
  readonly audioFinished$ = new Subject<AudioId>();

  /**
   * Emits when an audio playback state changes.
   */
  readonly playbackState$ = new BehaviorSubject<PlaybackState | undefined>(undefined);

  constructor() {
    from(
      listen('playback::audio::start', (event) => {
        const id = event.payload as AudioId;
        this.audioStarted$.next(id);
      })
    ).pipe(
      takeUntilDestroyed(),
      tap((unlisten) => unlisten())
    );

    from(
      listen('playback::audio::finish', (event) => {
        const id = event.payload as AudioId;
        this.audioFinished$.next(id);
      })
    ).pipe(
      takeUntilDestroyed(),
      tap((unlisten) => unlisten())
    );
  }

  /**
   * Gets a list of the available output devices.
   * @returns A list of the available output devices.
   */
  async listOutputDevices(): Promise<OutputDeviceList> {
    const devices = await invoke('plugin:playback|list_output_devices');
    return devices as OutputDeviceList;
  }

  /**
   * Sets the output device to use for playback.
   * @param deviceId The ID of the device to use.
   */
  async setOutputDevice(deviceId: DeviceId): Promise<void> {
    await invoke('plugin:playback|set_output_device', { deviceId });
  }

  /**
   * Enqueues the given audio data to be played. This does not wait for the audio to finish
   * playing.
   * @param request The audio data to play.
   */
  async playAudio(request: PlayAudioRequest): Promise<AudioId> {
    const id = await invoke('plugin:playback|play_audio', { request });
    return id as AudioId;
  }

  /**
   * Sets the playback state.
   * @param state The playback state to set.
   */
  async setPlaybackState(state: Partial<PlaybackState>): Promise<void> {
    const newState = await invoke('plugin:playback|set_playback_state', { state });
    this.playbackState$.next(newState as PlaybackState);
  }

  /**
   * Gets the current playback state.
   * @returns The current playback state.
   */
  async setAudioState(
    state: WithId<Partial<AudioState>, AudioId>
  ): Promise<void> {
    await invoke('plugin:playback|set_audio_state', { state });
  }

  /**
   * Lists the audio sources that are either playing or queued.
   * @returns The IDs of the audio sources that are either playing or queued.
   */
  async listAudio(): Promise<AudioId[]> {
    const audio = await invoke('plugin:playback|list_audio');
    return audio as AudioId[];
  }
}
