import { DestroyRef, inject, Injectable } from '@angular/core';
import { PlaybackService } from './playback.service';
import { LogService } from './logs.service';
import {
  VirtualMotionCaptureFeature,
  VirtualMotionCaptureState,
} from '../state/virtual-motion-capture/virtual-motion-capture.feature';
import { invoke } from "@tauri-apps/api/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { first } from "rxjs";
import { ConfigService } from "./config.service";
import { TtsType } from "../state/config/config.feature";

@Injectable()
export class VirtualMotionCaptureService {
  readonly #store = inject(VirtualMotionCaptureFeature);
  readonly #playbackService = inject(PlaybackService);
  readonly #logService = inject(LogService);
  readonly #destroyRef = inject(DestroyRef);
  readonly configService = inject(ConfigService);
  readonly #ttsType$ = this.configService.configTts$;

  // Easy way to clear all Ids when audio is skipped.
  private mouthShapesTimeouts: ReturnType<typeof setTimeout>[] = [];

  isAudioPlaying = false;

  constructor() {
    const port = this.#store.port();
    const host = this.#store.host();

    try {
      this.#logService.add(`Initializing VMC connect: ${{
        port,
        host,
      }}`, 'info', 'VirtualMotionCaptureService.constructor');
      invoke('update_vmc_connection', { port, host });
    } catch (e) {
      this.#logService.add(`Failed to initialize VMC connection: ${e}`, 'error', 'VirtualMotionCaptureService.constructor');
    }

    this.#playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.isAudioPlaying = true);

    this.#playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.isAudioPlaying = false);

    this.#playbackService.audioSkipped$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.isAudioPlaying = false;

        for (const timeout of this.mouthShapesTimeouts) {
          clearTimeout(timeout);
        }
      });

    this.#playbackService.audioMouthShapes$
      .pipe(takeUntilDestroyed())
      .subscribe(audioMouthShapes => this.prepareVTSMouthParams(audioMouthShapes));

  }

  testConnection() {
    try {
      this.#logService.add(`Testing VMC connection.`, 'info', 'VirtualMotionCaptureService.testConnection');
      invoke('test_vmc_connection');
    } catch (e) {
      this.#logService.add(`Failed to test VMC connection: ${e}`, 'error', 'VirtualMotionCaptureService.testConnection');
    }
  }

  updateState(state: Partial<VirtualMotionCaptureState>) {
    this.#store.updateState(state);

    this.updateConnection(state);
  }

  sendVmcMouth(params: [number, number]) {
    try {
      invoke('send_vmc_mouth', { params });
    } catch (e) {
      this.#logService.add(`Failed to send VMC mouth params: [${params}] ${e}`, 'error', 'VirtualMotionCaptureService.sendVmcMouth');
    }
  }

  private updateConnection(state: Partial<VirtualMotionCaptureState>) {
    const port = state.port ?? this.#store.port();
    const host = state.host ?? this.#store.host();

    try {
      invoke('update_vmc_connection', { port, host });
    } catch (e) {
      this.#logService.add(`Failed to update VMC info: ${{
        port,
        host,
      }}`, 'error', 'VirtualMotionCaptureService.updateConnection');
    }
  }

  private prepareVTSMouthParams(mouthShapes: [number, number][]) {
    this.#ttsType$
      .pipe(first(), takeUntilDestroyed(this.#destroyRef))
      .subscribe(ttsType => {
        const interval = this.getTtsSpeedInterval(ttsType);
        this.iterateMouthShapes(mouthShapes, interval);
      });
  }

  private getTtsSpeedInterval(ttsType: TtsType) {
    switch (ttsType) {
      case 'eleven-labs':
        return 12;
      default:
        return 24;
    }
  }

  private iterateMouthShapes(mouthShapes: [number, number][], interval: number) {
    let delay = 0; // Add interval to this as a sum.

    for (const shape of mouthShapes) {
      const timeout = setTimeout(() => {
        this.sendVmcMouth(shape);
      }, delay);

      this.mouthShapesTimeouts.push(timeout);

      delay += interval;
    }
  }
}
