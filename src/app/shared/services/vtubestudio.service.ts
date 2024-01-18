import { inject, Injectable } from '@angular/core';
import { LogService } from './logs.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { v4 as uuid } from 'uuid';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AuthResponse,
  TTSHelperParameterNames,
  TTSHelperParameters,
  VTubeStudioMessageType,
} from './vtubestudio.interface';
import { ConfigService } from './config.service';
import { PlaybackService } from './playback.service';
import { Store } from '@ngrx/store';
import { VTubeStudioFeature, VTubeStudioState } from '../state/vtubestudio/vtubestudio.feature.';
import { VTubeStudioActions } from '../state/vtubestudio/vtubestudio.actions';
import { BehaviorSubject, interval } from 'rxjs';

@Injectable()
export class VTubeStudioService {
  private readonly store = inject(Store);
  private readonly logService = inject(LogService);
  private readonly playbackService = inject(PlaybackService);
  private readonly configService = inject(ConfigService);
  private readonly snackbar = inject(MatSnackBar);

  private readonly vtsBasics = {
    apiName: 'VTubeStudioPublicAPI',
    apiVersion: '1.0',
    requestID: 'Nothing-Burger',
  };

  private readonly pluginInfo = {
    pluginName: 'TTS Helper',
    pluginDeveloper: 'Panku',
    // VTubeStudio wants a B64 encoded image. This currently doesn't fit the size they want
    // pluginIcon: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjM1LjM2MzYgMS4xOTIwOWUtNyAxNS4xOSAyNi42NyI+DQogIDxwYXRoIGQ9Ik00My40NTg2IDAuMjIwODEzQzQyLjgzOCAtMC4xODY0MDkgNDIuMDA0MSAtMC4wMTQ3NDI1IDQxLjU5NjkgMC42MDY5MjRDNDEuMTg5MSAxLjIyNzQ4IDQxLjM2MjQgMi4wNjEzNyA0MS45ODMgMi40Njg1OUM0NS42NjQ3IDQuODg0NyA0Ny44NjE5IDguOTQ2MzcgNDcuODYxOSAxMy4zMzQxQzQ3Ljg2MTkgMTcuNzIxOSA0NS42NjQ3IDIxLjc4MzYgNDEuOTgzIDI0LjE5OTdDNDEuMzYyNCAyNC42MDY0IDQxLjE4OTEgMjUuNDQwOCA0MS41OTY5IDI2LjA2MDhDNDEuOTg4IDI2LjY1NTggNDIuODE1MiAyNi44Njk3IDQzLjQ1ODYgMjYuNDQ2OUM0Ny44OTg2IDIzLjUzMjUgNTAuNTUwMiAxOC42Mjk3IDUwLjU1MDIgMTMuMzMzNkM1MC41NTAyIDguMDM3NDggNDcuODk4NiAzLjEzNTI2IDQzLjQ1ODYgMC4yMjA4MTNaTTQ1LjIxNjkgMTMuMzMzNkM0NS4yMTY5IDkuODA0MTUgNDMuNDM1OCA2LjU1OTE1IDQwLjQ1MTkgNC42NTM1OUMzOS44MzAyIDQuMjU2OTIgMzkuMDA1OCA0LjQ0MTM3IDM4LjYxMTkgNS4wNjgwM0MzOC4yMTggNS42OTQ3IDM4LjQwMTkgNi41MjQxNSAzOS4wMjM2IDYuOTIxMzdDNDEuMjMxOSA4LjMzMTkyIDQyLjU1MDIgMTAuNzI4NiA0Mi41NTAyIDEzLjMzMzZDNDIuNTUwMiAxNS45Mzg2IDQxLjIzMTkgMTguMzM1MyAzOS4wMjM2IDE5Ljc0NThDMzguNDAxOSAyMC4xNDI1IDM4LjIxOCAyMC45NzE5IDM4LjYxMTkgMjEuNTk5MUMzOC45NzM2IDIyLjE3NDcgMzkuNzg1MiAyMi40NDAzIDQwLjQ1MTkgMjIuMDEzNkM0My40MzU4IDIwLjEwOCA0NS4yMTY5IDE2Ljg2MzYgNDUuMjE2OSAxMy4zMzM2Wk0zNy4zNDA4IDkuMDYzMDNDMzYuNjk3NCA4LjcxMTM3IDM1Ljg4NTggOC45NDMwMyAzNS41MjkxIDkuNTg4MDNDMzUuMTc0MSAxMC4yMzMgMzUuNDA5MSAxMS4wNDM2IDM2LjA1NDEgMTEuMzk5N0MzNi43NzEzIDExLjc5MzYgMzcuMjE2OSAxMi41MzUzIDM3LjIxNjkgMTMuMzMzNkMzNy4yMTY5IDE0LjEzMjUgMzYuNzcxMyAxNC44NzM2IDM2LjA1NDcgMTUuMjY3NUMzNS40MDk3IDE1LjYyMzYgMzUuMTc0NyAxNi40MzQxIDM1LjUyOTcgMTcuMDc5MUMzNS44ODY5IDE3LjcyNjkgMzYuNjk5MSAxNy45NTY5IDM3LjM0MTMgMTcuNjA0MUMzOC45MDk3IDE2Ljc0MDMgMzkuODg0MSAxNS4xMDQxIDM5Ljg4NDEgMTMuMzMzQzM5Ljg4NDEgMTEuNTYxOSAzOC45MDk3IDkuOTI2MzcgMzcuMzQwOCA5LjA2MzAzWiIgZmlsbD0iIzAwNzVGRiIvPg0KPC9zdmc+',
  };

  readonly state$ = this.store.select(VTubeStudioFeature.selectVTubeStudioFeatureState);
  readonly port$ = this.store.select(VTubeStudioFeature.selectPort);
  readonly isMouthOpenEnabled$ = this.store.select(VTubeStudioFeature.selectIsMirrorMouthOpenEnabled);
  readonly isMouthFormEnabled$ = this.store.select(VTubeStudioFeature.selectIsMirrorMouthFormEnabled);
  readonly isConnected$ = new BehaviorSubject<boolean>(false);

  isMouthOpenEnabled = false;
  isMouthFormEnabled = false;

  // Try to connect to default.
  private port = 8001;
  private socket = new WebSocket(`ws://localhost:8001`);
  private vtsAuthToken = '';
  private authenticationRequestUUID = uuid();

  /**
   * These intervals are for constantly requesting user mouth shape info so it can be sent to their model
   * 60 is an arbitrary number for now.
   *
   * Initialize the variable for 1 tick, due to laziness. It'll be destroyed and assigned over and over as
   * users toggle settings and the 1hour interval keeping watch of it.
   */
  private mouthTrackingInterval = setInterval(() => {
    console.info('Initial interval for types sake. :)');
  }, 60);

  /**
   * @TODO - When audio is skipped this never gets cleared since AudioFinished never fires
   */
  randomMouthInterval?: NodeJS.Timer = undefined;

  constructor() {
    this.port$.pipe(takeUntilDestroyed())
      .subscribe(port => {
        this.port = port;
        this.logService.add(
          `Attempting to connect to VTS on port ${port}`,
          'info',
          'VTubeStudioService',
        );

        this.socket.close();

        this.setupSocketHandlers();
      });

    this.isMouthOpenEnabled$.pipe(takeUntilDestroyed())
      .subscribe(isMouthOpenEnabled => {
        // Destroy mouth tracking, use the change as a way to cleanup memory
        clearInterval(this.mouthTrackingInterval);
        this.isMouthOpenEnabled = isMouthOpenEnabled;

        if (this.isTracking) {
          this.mouthTrackingInterval = this.createMouthTrackingInterval();
        }
      });

    this.isMouthFormEnabled$.pipe(takeUntilDestroyed())
      .subscribe(isMouthFormEnabled => {
        // Destroy mouth tracking, use the change as a way to cleanup memory
        clearInterval(this.mouthTrackingInterval);
        this.isMouthFormEnabled = isMouthFormEnabled;

        if (this.isTracking) {
          this.mouthTrackingInterval = this.createMouthTrackingInterval();
        }
      });

    this.configService.authTokens$.pipe(takeUntilDestroyed())
      .subscribe((tokens) => this.vtsAuthToken = tokens.vtsAuthToken);

    this.playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.randomMouth(true));

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.randomMouth(false));

    this.playbackService.audioSkipped$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.randomMouth(false));
  }

  private get isTracking() {
    return this.isMouthOpenEnabled || this.isMouthFormEnabled;
  }

  private createMouthTrackingInterval() {
    return setInterval(() => {
      if (!this.isConnected$.value || !this.vtsAuthToken) {
        return;
      }

      if (this.isMouthFormEnabled) {
        this.requestUserMouthInfo(VTubeStudioMessageType.MouthSmile);
      }
      if (this.isMouthOpenEnabled) {
        this.requestUserMouthInfo(VTubeStudioMessageType.MouthOpen);
      }
    }, 60);
  }

  private setupSocketHandlers() {
    this.socket = new WebSocket(`ws://localhost:${this.port}`);

    this.socket.addEventListener('open', (event) => {
      // Check if VTS is already authenticated.
      if (this.vtsAuthToken) {
        // Verify token in state
        this.verifyAuthToken(this.vtsAuthToken);
      }

      this.logService.add(
        `VTS WS connection opened. \n${JSON.stringify(event, undefined, 2)}`,
        'info',
        'VTubeStudioService',
      );
    });

    this.socket.addEventListener('message', (event) => {
      // Data is stringified
      const data = JSON.parse(event.data);

      switch (data.messageType) {
        case VTubeStudioMessageType.APIError:
          this.handleAPIError(data);
          break;
        case VTubeStudioMessageType.AuthenticationTokenResponse:
          this.verifyAuthToken(data.data?.authenticationToken);
          break;
        case VTubeStudioMessageType.AuthenticationResponse:
          this.handleAuthResponse(data.data);
          break;
        case VTubeStudioMessageType.ParameterValueResponse:
          // A lot of these can happen, return to avoid spamming logs.
          return this.handleDefaultParams(data.data);
        // Return for custom parameters to avoid spamming the logs.
        case VTubeStudioMessageType.InjectParameterDataResponse:
          return;
      }

      this.logService.add(
        `Message received. \n${JSON.stringify(data, undefined, 2)}`,
        'info',
        'VTubeStudioService',
      );
    });

    this.socket.addEventListener('close', () => {
      if (this.isConnected$.value) {
        this.logService.add('Connection to VTS closed.', 'info', 'VTubeStudioService');
      }

      this.socket.close();
      this.isConnected$.next(false);

      // If the user has authed with us before just assume they want us to auto connect.
      if (this.vtsAuthToken) {
        setTimeout(() => this.setupSocketHandlers(), 3000);
      }
    });

    this.socket.addEventListener('error', (event) => {
      if (this.isConnected$.value) {
        this.logService.add(
          `Issue connecting to VTube Studio websocket.\n${JSON.stringify(
            event,
            undefined,
            2,
          )}`,
          'error',
          'VTubeStudioService',
        );
      }
    });
  }

  /**
   * Mimic users MouthOpen and MouthSmile data by sending it to {@link TTSHelperParameterNames.TTSHelperMouthForm} or {@link TTSHelperParameterNames.TTSHelperMouthOpen}
   * @param data Data sent by VTS. Could be any parameter name / value pair.
   * @private
   */
  private handleDefaultParams(data: { name: string, value: number }) {
    // If TTS is playing ignore users mouth movement.
    if (this.randomMouthInterval) {
      return;
    }

    const { name, value } = data;

    // We currently only care about default parameters.
    if (name !== VTubeStudioMessageType.MouthSmile && name !== VTubeStudioMessageType.MouthOpen) {
      return;
    }

    // Determine which of the TTS Helper IDs we need to use.
    const id = name === VTubeStudioMessageType.MouthSmile ? TTSHelperParameterNames.TTSHelperMouthForm : TTSHelperParameterNames.TTSHelperMouthOpen;

    // Mirror users mouth data to the TTS Helper parameters
    this.socket.send(JSON.stringify({
      ...this.vtsBasics,
      messageType: VTubeStudioMessageType.InjectParameterDataRequest,
      data: {
        faceFound: false,
        mode: 'set',
        parameterValues: [
          {
            id,
            value,
          },
        ],
      },
    }));
  }

  /**
   * Verify users VTS token is valid
   * @param authenticationToken VTS Token
   */
  private verifyAuthToken(authenticationToken: string) {
    const { readyState, CLOSED, CLOSING, CONNECTING } = this.socket;

    // Obviously if the socket is dead ignore all intervals.
    if (readyState === CLOSED || readyState === CLOSING || readyState === CONNECTING) {
      return;
    }

    // Assume the token is valid and assign here.
    this.vtsAuthToken = authenticationToken;

    this.socket.send(JSON.stringify({
      ...this.vtsBasics,
      messageType: VTubeStudioMessageType.AuthenticationRequest,
      data: {
        ...this.pluginInfo,
        authenticationToken,
      },
    }));
  }

  /**
   * Request user to authorize us with VTS
   * @private
   */
  private requestUserAuth() {
    const { readyState, CLOSED, CLOSING, CONNECTING } = this.socket;

    // Obviously if the socket is dead ignore all intervals.
    if (readyState === CLOSED || readyState === CLOSING || readyState === CONNECTING) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        ...this.vtsBasics,
        requestID: this.authenticationRequestUUID,
        messageType: VTubeStudioMessageType.AuthenticationTokenRequest,
        data: this.pluginInfo,
      }),
    );
  }

  /**
   * Request mouth data from VTS if the user wishes to mirror that data to their model.
   * @param name Either MouthOpen or MouthSmile
   * @private
   */
  private requestUserMouthInfo(name: VTubeStudioMessageType.MouthOpen | VTubeStudioMessageType.MouthSmile) {
    const { readyState, CLOSED, CLOSING, CONNECTING } = this.socket;

    // Obviously if the socket is dead ignore all intervals.
    if (readyState === CLOSED || readyState === CLOSING || readyState === CONNECTING) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        ...this.vtsBasics,
        messageType: VTubeStudioMessageType.ParameterValueRequest,
        data: {
          name,
        },
      }),
    );
  }

  private handleAuthResponse(data: AuthResponse) {
    if (!data.authenticated) {
      this.logService.add(
        `Auth response not authenticated. \n${JSON.stringify(data, undefined, 2)}`,
        'info',
        'VTubeStudioService.handleAuthResponse',
      );

      this.configService.updateVTSToken('');

      return this.snackbar.open(
        `Could not authenticate token with VTS. Reason: ${data.reason}`,
        'Dismiss',
        {
          panelClass: 'notification-error',
        },
      );
    }

    this.logService.add(
      `Authenticated token with VTS.\n${JSON.stringify(
        data,
        undefined,
        2,
      )}`,
      'info',
      'VTubeStudioService',
    );

    this.isConnected$.next(true);
    this.getParameterValues();

    this.configService.updateVTSToken(this.vtsAuthToken);
  }

  private handleAPIError(data: unknown) {
    this.logService.add(
      `API Error. \n${JSON.stringify(data, undefined, 2)}`,
      'error',
      'VTubeStudioService.handleAPIError',
    );

    return this.snackbar.open(
      'Encountered VTubeStudio API Error.',
      'Dismiss',
      {
        panelClass: 'notification-error',
      },
    );
  }

  /**
   * Create our custom VTS parameters for VTS.
   * Do this each time we connect to ensure the user has them available.
   * @private
   */
  private getParameterValues() {
    for (const parameter of TTSHelperParameters) {
      this.socket.send(JSON.stringify({
        ...this.vtsBasics,
        messageType: VTubeStudioMessageType.ParameterCreationRequest,
        data: parameter,
      }));
    }
  }

  /**
   * Turn on or off the random VTS mouth information
   * @param enabled Whether to send mouth data to users model.
   * @private
   */
  private randomMouth(enabled: boolean) {
    const { readyState, CLOSED, CLOSING, CONNECTING } = this.socket;

    if (!enabled || readyState === CLOSED || readyState === CLOSING || readyState === CONNECTING) {
      clearInterval(this.randomMouthInterval);

      return this.randomMouthInterval = undefined;
    }

    this.randomMouthInterval = setInterval(() => this.sendRandomMouthParams(), 150);
  }

  private sendRandomMouthParams() {
    if (!this.vtsAuthToken) {
      return;
    }

    const mouthOpen = Math.random();
    const mouthForm = 0.5;

    this.socket.send(JSON.stringify({
      ...this.vtsBasics,
      messageType: VTubeStudioMessageType.InjectParameterDataRequest,
      data: {
        faceFound: false,
        mode: 'set',
        parameterValues: [
          {
            id: TTSHelperParameterNames.TTSHelperMouthOpen,
            value: mouthOpen,
          },
        ],
      },
    }));

    this.socket.send(JSON.stringify({
      ...this.vtsBasics,
      messageType: VTubeStudioMessageType.InjectParameterDataRequest,
      data: {
        faceFound: false,
        mode: 'set',
        parameterValues: [
          {
            id: TTSHelperParameterNames.TTSHelperMouthForm,
            value: mouthForm,
          },
        ],
      },
    }));
  }

  updateState(partialState: Partial<VTubeStudioState>) {
    this.store.dispatch(VTubeStudioActions.updateState({ partialState }));
  }

  /**
   * Let users decide when they want to connect with VTS.
   */
  auth() {
    const { readyState, CLOSED } = this.socket;

    // If the socket is closed and the user is trying to auth, try to bring the websocket back to life.
    if (readyState === CLOSED) {
      this.setupSocketHandlers();
    }

    // Assuming the above is true, we need to wait for the socket to come alive. Wait an arbitrary amount of time before authing.
    setTimeout(() => this.requestUserAuth(), 1000);
  }

  /**
   * Clear out the token to "deauth" the user.
   */
  deauth() {
    this.vtsAuthToken = '';
    this.configService.updateVTSToken(this.vtsAuthToken);
  }
}
