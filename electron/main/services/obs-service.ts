import OBSWebSocket from 'obs-websocket-js';
import type { ObsSettings } from '../../../src/shared/types';
import type { LogService } from './log-service';

export class ObsService {
  private client: OBSWebSocket | null = null;
  private connectedUrl = '';

  constructor(private readonly logs: LogService) {}

  async getStreamOffsetMs(settings: ObsSettings): Promise<number | null> {
    if (!settings.enabled) {
      return null;
    }

    try {
      const client = await this.connect(settings);
      const status = await client.call('GetStreamStatus');
      const duration = Number(status.outputDuration ?? 0);

      return Number.isFinite(duration) && duration > 0 ? duration : null;
    } catch (error) {
      this.logs.add('warn', 'ObsService.getStreamOffsetMs', this.formatError(error));
      return null;
    }
  }

  private async connect(settings: ObsSettings): Promise<OBSWebSocket> {
    if (this.client && this.connectedUrl === settings.url) {
      return this.client;
    }

    this.client?.disconnect();
    this.client = new OBSWebSocket();
    await this.client.connect(settings.url, settings.password || undefined);
    this.connectedUrl = settings.url;

    return this.client;
  }

  private formatError(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
  }
}
