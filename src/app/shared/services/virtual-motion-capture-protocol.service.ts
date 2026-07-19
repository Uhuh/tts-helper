import { computed, DestroyRef, inject, Injectable } from '@angular/core';
import { PlaybackService } from './playback.service';
import { LogService } from './logs.service';
import { VirtualMotionCaptureFeature, VirtualMotionCaptureState } from '../state/virtual-motion-capture/virtual-motion-capture.feature';
import { invoke } from '@tauri-apps/api/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { first } from 'rxjs';
import { ConfigService } from './config.service';
import { TtsType } from '../state/config/config.feature';
import { AppSettingsService } from './app-settings.service';
import { ConnectionStatusSnapshot } from '../state/models/connection-status.model';

@Injectable()
export class VirtualMotionCaptureProtocolService {
  readonly store = inject(VirtualMotionCaptureFeature);
  readonly #appSettingsService = inject(AppSettingsService);
  readonly #playbackService = inject(PlaybackService);
  readonly #configService = inject(ConfigService);
  readonly #logService = inject(LogService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #ttsType$ = this.#configService.configTts$;

  readonly connectionStatus$ = toObservable(computed((): ConnectionStatusSnapshot => {
      const state = this.store.wholeState();
      const hasHost = !!state.host?.trim();
      const hasPort = !!state.port;
      const enabled = this.connections()?.vmc ?? false;

      if (!enabled) {
        return {
          status: 'disconnected',
          tooltip: 'VMC Protocol disabled',
        };
      }

      if (!hasHost || !hasPort) {
        return {
          status: 'partial',
          tooltip: 'VMC Protocol configured but missing host or port',
        };
      }

      return {
        status: 'connected',
        tooltip: `VMC Protocol sending to ${state.host}:${state.port}`,
      };
    },
  ));

  readonly connections = toSignal(this.#appSettingsService.connections$);

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
  }

  clearAudioPlaying() {
    if (!this.connections()?.vmc) {
      return;
    }

    this.isAudioPlaying = false;

    for (const timeout of this.mouthShapesTimeouts) {
      clearTimeout(timeout);
    }

    const mouthAParam = this.store.mouth_a_param();
    const mouthEParam = this.store.mouth_e_param();
    const sendToVnyan = this.store.send_vnyan_params();

    invoke('reset_vmc_mouth', { mouthParams: [mouthAParam, mouthEParam], sendToVnyan });
  }

  testConnection() {
    this.#logService.add(`Testing VMC connection.`, 'info', 'VirtualMotionCaptureService.testConnection');

    const mouthAParam = this.store.mouth_a_param();
    const mouthEParam = this.store.mouth_e_param();
    const sendToVnyan = this.store.send_vnyan_params();

    invoke('test_vmc_connection', { mouthParams: [mouthAParam, mouthEParam], sendToVnyan })
      .catch(e => {
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
    const sendToVnyan = this.store.send_vnyan_params();
    // Check for states that don't default the new property value.
    const blendshape_modifier = (this.store.blendshape_modifier() ?? 100) / 100;

    invoke('send_vmc_mouth', {
      mouthData: {
        mouth_a_name,
        mouth_a_value: params[0] * blendshape_modifier,
        mouth_e_name,
        mouth_e_value: params[1] * blendshape_modifier,
      },
      sendToVnyan,
    });
  }

  private updateConnection(state: Partial<VirtualMotionCaptureState>) {
    const port = state.port ?? this.store.port();
    const host = state.host ?? this.store.host();

    invoke('update_vmc_connection', { port, host })
      .catch(() => {
        this.#logService.add(`Failed to update VMC info: ${{
          port,
          host,
        }}`, 'error', 'VirtualMotionCaptureService.updateConnection');
      });
  }

  private prepareVTSMouthParams(mouthShapes: [number, number][]) {
    if (!this.connections()?.vmc) {
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
