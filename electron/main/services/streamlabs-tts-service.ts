import fs from 'node:fs/promises';
import path from 'node:path';
import type { QueueItemRecord, TtsSettings } from '../../../src/shared/types';
import type { LogService } from './log-service';

interface StreamlabsResponse {
  speak_url?: string;
}

export class StreamlabsTtsService {
  private readonly endpoint = 'https://streamlabs.com/polly/speak';

  constructor(
    private readonly audioDirectory: string,
    private readonly logs: LogService,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async generate(item: QueueItemRecord, settings: TtsSettings): Promise<string> {
    await fs.mkdir(this.audioDirectory, { recursive: true });

    const url = new URL(this.endpoint);
    url.searchParams.set('voice', settings.voice);
    url.searchParams.set('text', this.formatSpeechText(item));

    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        Referer: 'https://streamlabs.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`Streamlabs returned ${response.status}.`);
    }

    const json = (await response.json()) as StreamlabsResponse;
    if (!json.speak_url) {
      throw new Error('Streamlabs response did not include speak_url.');
    }

    const audioResponse = await this.fetchImpl(json.speak_url);
    if (!audioResponse.ok) {
      throw new Error(`Streamlabs audio download returned ${audioResponse.status}.`);
    }

    const audioPath = path.join(this.audioDirectory, `${item.id}.mp3`);
    const data = Buffer.from(await audioResponse.arrayBuffer());
    await fs.writeFile(audioPath, data);

    this.logs.add('info', 'StreamlabsTtsService.generate', `Generated audio for item ${item.id}.`);

    return audioPath;
  }

  private formatSpeechText(item: QueueItemRecord): string {
    const viewer = item.username.trim() || 'Someone';
    return `${viewer} says ${item.text}`;
  }
}
