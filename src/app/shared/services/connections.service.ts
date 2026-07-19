import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AppSettingsService } from './app-settings.service';
import { TwitchService } from './twitch.service';
import { YoutubeService } from './youtube.service';
import { VTubeStudioService } from './vtubestudio.service';
import { VirtualMotionCaptureProtocolService } from './virtual-motion-capture-protocol.service';
import { CONNECTION_REGISTRY, ConnectionKind } from '../state/app-settings/app-settings.feature';
import { ConnectionStatusSnapshot } from '../state/models/connection-status.model';

const DEFAULT_CONNECTION_STATUS = { status: 'unknown', tooltip: '' } satisfies ConnectionStatusSnapshot;

@Injectable({ providedIn: 'root' })
export class ConnectionsService {
  private readonly appSettingsService = inject(AppSettingsService);
  private readonly twitchService = inject(TwitchService);
  private readonly youtubeService = inject(YoutubeService);
  private readonly vtubeStudioService = inject(VTubeStudioService);
  private readonly vmcService = inject(VirtualMotionCaptureProtocolService);

  private readonly enabled = toSignal(
    this.appSettingsService.state$.pipe(map((s) => s.connections)),
    { initialValue: {} as Record<ConnectionKind, boolean> },
  );

  private readonly expanded = toSignal(
    this.appSettingsService.state$.pipe(map((s) => s.connectionsExpanded)),
    { initialValue: true },
  );

  private readonly twitchStatus = toSignal(
    this.twitchService.connectionStatus$,
    { initialValue: DEFAULT_CONNECTION_STATUS },
  );

  private readonly youtubeStatus = toSignal(
    this.youtubeService.connectionStatus$,
    { initialValue: DEFAULT_CONNECTION_STATUS },
  );

  private readonly vtsStatus = toSignal(
    this.vtubeStudioService.connectionStatus$,
    { initialValue: DEFAULT_CONNECTION_STATUS },
  );

  private readonly vmcStatus = toSignal(
    this.vmcService.connectionStatus$,
    { initialValue: DEFAULT_CONNECTION_STATUS },
  );

  readonly connections = computed(() => {
    const statuses: Record<ConnectionKind, ConnectionStatusSnapshot> = {
      twitch: this.twitchStatus(),
      youtube: this.youtubeStatus(),
      vtubestudio: this.vtsStatus(),
      vmc: this.vmcStatus(),
      kick: DEFAULT_CONNECTION_STATUS,
      picarto: DEFAULT_CONNECTION_STATUS,
      tiktok: DEFAULT_CONNECTION_STATUS,
    };

    return Object.values(CONNECTION_REGISTRY).map((config) => ({
      ...config,
      ...statuses[config.kind],
      enabled: this.enabled()[config.kind] ?? false,
    }));
  });

  readonly connectionsExpanded = computed(() => this.expanded());
}