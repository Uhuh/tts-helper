import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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

@Injectable()
export class VTubeStudioService {
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

  // 8001 is the default port and most likely wont change for users.
  port$ = new BehaviorSubject(8001);
  // Try to connect to default.
  socket = new WebSocket(`ws://localhost:8001`);

  vtsAuthToken = '';
  authenticationRequestUUID = uuid();

  randomMouthInterval?: any = undefined;

  constructor(
    private readonly logService: LogService,
    private readonly playbackService: PlaybackService,
    private readonly configService: ConfigService,
    private readonly snackbar: MatSnackBar,
  ) {
    this.port$.pipe(takeUntilDestroyed())
      .subscribe(port => {
        this.logService.add(
          `Attempting to connect to VTS on port ${port}`,
          'info',
          'VTubeStudioService',
        );

        this.socket = new WebSocket(`ws://localhost:${port}`);
      });

    this.configService.authTokens$.pipe(takeUntilDestroyed())
      .subscribe((tokens) => this.vtsAuthToken = tokens.vtsAuthToken);

    this.playbackService.audioStarted$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.randomMouth(true));

    this.playbackService.audioFinished$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.randomMouth(false));

    this.socket.addEventListener('open', (event) => {
      // Check if VTS is already authenticated.
      if (!this.vtsAuthToken) {
        this.requestUserAuth();
      } else {
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

    this.socket.addEventListener('error', (event) => {
      this.logService.add(
        `Issue connecting to VTube Studio websocket.\n${JSON.stringify(
          event,
          undefined,
          2,
        )}`,
        'error',
        'VTubeStudioService',
      );
    });
  }

  /**
   * Verify users VTS token is valid
   * @param authenticationToken VTS Token
   */
  private verifyAuthToken(authenticationToken: string) {
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

  private requestUserAuth() {
    this.socket.send(
      JSON.stringify({
        ...this.vtsBasics,
        requestID: this.authenticationRequestUUID,
        messageType: VTubeStudioMessageType.AuthenticationTokenRequest,
        data: this.pluginInfo,
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

      this.vtsAuthToken = '';

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

    this.snackbar.open(
      `Connected with VTS`,
      'Dismiss',
      {
        duration: 3000,
        panelClass: 'notification-success',
      },
    );

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

  private getParameterValues() {
    for (const parameter of TTSHelperParameters) {
      this.socket.send(JSON.stringify({
        ...this.vtsBasics,
        messageType: VTubeStudioMessageType.ParameterCreationRequest,
        data: parameter,
      }));
    }
  }

  private randomMouth(enabled: boolean) {
    const { readyState, CLOSED, CLOSING } = this.socket;

    if (!enabled || readyState === CLOSED || readyState === CLOSING) {
      return clearInterval(this.randomMouthInterval);
    }

    this.randomMouthInterval = setInterval(() => this.sendRandomMouthParams(), 75);
  }

  private sendRandomMouthParams() {
    const mouthOpen = Math.random();
    const mouthForm = Math.random() * 2 - 1;

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

  updatePort(port: number) {
    this.port$.next(port);
  }
}
