import { ApplicationRef, inject, Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { BehaviorSubject, from, Subject, tap } from 'rxjs';
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
import { Store } from '@ngrx/store';
import { AudioActions } from '../state/audio/audio.actions';
import { AudioStatus } from '../state/audio/audio.feature';

@Injectable()
export class PlaybackService {
  private readonly store = inject(Store);
  private readonly ref = inject(ApplicationRef);
  
  /**
   * Emits when an audio source starts playing.
   */
  readonly audioStarted$ = new Subject<AudioId>();

  /**
   * Emits when an audio source finishes playing.
   */
  readonly audioFinished$ = new Subject<AudioId>();

  /**
   * Emits when an audio source is skipped.
   */
  readonly audioSkipped$ = new Subject<void>();

  /**
   * Emits when an audio playback state changes.
   */
  readonly playbackState$ = new BehaviorSubject<PlaybackState | undefined>(undefined);

  readonly isPaused$ = new BehaviorSubject<boolean>(false);

  currentlyPlaying: AudioId | null = null;

  // The Application ref helps make the history / queue view update once an item is finished/started/skipped etc.
  constructor() {
    from(
      listen('playback::audio::start', (event) => {
        const id = event.payload as AudioId;
        this.audioStarted$.next(id);
        this.currentlyPlaying = id;

        this.ref.tick();
      }),
    ).pipe(
      takeUntilDestroyed(),
      tap((unlisten) => unlisten()),
    );

    from(
      listen('playback::audio::finish', (event) => {
        const id = event.payload as AudioId;
        this.audioFinished$.next(id);
        this.currentlyPlaying = null;

        this.ref.tick();
      }),
    ).pipe(
      takeUntilDestroyed(),
      tap((unlisten) => unlisten()),
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

  async setVolumeLevel(volumeLevel: number): Promise<void> {
    // Rodio takes the volume range from 0 -> 1
    await invoke('plugin:playback|set_output_volume', { volumeLevel: volumeLevel / 100 });
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

  async togglePause() {
    const isPaused = await invoke('plugin:playback|toggle_pause');

    this.isPaused$.next(isPaused as boolean);
  }

  /**
   * Sets the playback state.
   * @param state The playback state to set.
   */
  async setPlaybackState(state: Partial<PlaybackState>): Promise<void> {
    const newState = await invoke('plugin:playback|set_playback_state', { state });
    this.playbackState$.next(newState as PlaybackState);
  }

  async skipCurrentlyPlaying() {
    if (this.currentlyPlaying === null) {
      return;
    }

    /**
     * @TODO - Figure out how to get the Rust side to handle this instead.
     */
    this.setAudioState({ id: this.currentlyPlaying, skipped: true });
    this.store.dispatch(AudioActions.updateAudioState({ id: this.currentlyPlaying, audioState: AudioStatus.skipped }));
    this.audioSkipped$.next();
    this.currentlyPlaying = null;
  }

  /**
   * Gets the current playback state.
   * @returns The current playback state.
   */
  async setAudioState(
    state: WithId<Partial<AudioState>, AudioId>,
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
