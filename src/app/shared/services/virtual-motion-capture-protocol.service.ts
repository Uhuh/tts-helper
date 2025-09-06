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
export class VirtualMotionCaptureProtocolService {
  readonly store = inject(VirtualMotionCaptureFeature);
  readonly #playbackService = inject(PlaybackService);
  readonly #configService = inject(ConfigService);
  readonly #logService = inject(LogService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #ttsType$ = this.#configService.configTts$;

  private validConnection = false;
  private connectionCheckIntervalId: ReturnType<typeof setInterval> | null = null;

  // Easy way to clear all Ids when audio is skipped.
  private mouthShapesTimeouts: ReturnType<typeof setTimeout>[] = [];

  isAudioPlaying = false;

  constructor() {
    const port = this.store.port();
    const host = this.store.host();

    this.#logService.add(`Initializing VMC connect: ${JSON.stringify({
      port,
      host,
    })}`, 'info', 'VirtualMotionCaptureService.constructor');

    this.#playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.isAudioPlaying = true);

    this.#playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.clearAudioPlaying());

    this.#playbackService.audioSkipped$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.clearAudioPlaying());

    this.#playbackService.audioMouthShapes$
      .pipe(takeUntilDestroyed())
      .subscribe(audioMouthShapes => this.prepareVTSMouthParams(audioMouthShapes));

    this.startConnectionCheck();
  }

  private startConnectionCheck() {
    this.stopConnectionCheck();

    const check = async () => {
      if (this.validConnection) {
        return;
      }

      invoke('send_vmc_mouth', {
        mouthData: {
          mouth_a_name: 'A',
          mouth_a_value: 0,
          mouth_e_name: 'E',
          mouth_e_value: 0,
        },
      })
        .then(() => this.validConnection = true)
        .catch(() => this.validConnection = false);
    };

    check();

    this.connectionCheckIntervalId = setInterval(check, 5000);
  }

  private stopConnectionCheck() {
    if (this.connectionCheckIntervalId !== null) {
      clearInterval(this.connectionCheckIntervalId);
      this.connectionCheckIntervalId = null;
    }
  }

  clearAudioPlaying() {
    if (!this.validConnection) {
      return;
    }

    this.isAudioPlaying = false;

    for (const timeout of this.mouthShapesTimeouts) {
      clearTimeout(timeout);
    }

    const mouthAParam = this.store.mouth_a_param();
    const mouthEParam = this.store.mouth_e_param();

    invoke('reset_vmc_mouth', { mouthParams: [mouthAParam, mouthEParam] })
      .catch(() => this.validConnection = false);
  }

  testConnection() {
    this.#logService.add(`Testing VMC connection.`, 'info', 'VirtualMotionCaptureService.testConnection');

    const mouthAParam = this.store.mouth_a_param();
    const mouthEParam = this.store.mouth_e_param();

    invoke('test_vmc_connection', { mouthParams: [mouthAParam, mouthEParam] })
      .catch(e => {
        this.validConnection = false;
        this.#logService.add(`Failed to test VMC connection: ${e}`, 'error', 'VirtualMotionCaptureService.testConnection');
      });
  }

  updateState(state: Partial<VirtualMotionCaptureState>) {
    this.store.updateState(state);

    this.updateConnection(state);
  }

  sendVmcMouth(params: [number, number]) {
    const mouth_a_name = this.store.mouth_a_param();
    const mouth_e_name = this.store.mouth_e_param();
    // Check for states that don't default the new property value.
    const blendshape_modifier = (this.store.blendshape_modifier() ?? 100) / 100;

    invoke('send_vmc_mouth', {
      mouthData: {
        mouth_a_name,
        mouth_a_value: params[0] * blendshape_modifier,
        mouth_e_name,
        mouth_e_value: params[1] * blendshape_modifier,
      },
    })
      .catch(e => {
        this.validConnection = false;
        this.#logService.add(`Failed to send VMC mouth params: [${params}] ${e}`, 'error', 'VirtualMotionCaptureService.sendVmcMouth');
      });
  }

  private updateConnection(state: Partial<VirtualMotionCaptureState>) {
    const port = state.port ?? this.store.port();
    const host = state.host ?? this.store.host();

    invoke('update_vmc_connection', { port, host })
      .then(() => this.startConnectionCheck())
      .catch(() => {
        this.validConnection = false;
        this.#logService.add(`Failed to update VMC info: ${{
          port,
          host,
        }}`, 'error', 'VirtualMotionCaptureService.updateConnection');
      });
  }

  private prepareVTSMouthParams(mouthShapes: [number, number][]) {
    if (!this.validConnection) {
      return;
    }

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
