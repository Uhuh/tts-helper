import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { LogService } from '../../electron/main/services/log-service';
import { StreamlabsTtsService } from '../../electron/main/services/streamlabs-tts-service';
import { openDatabase } from '../../electron/main/db/database';
import type { QueueItemRecord } from '../../src/shared/types';

describe('StreamlabsTtsService', () => {
  it('calls Streamlabs and stores mp3 audio locally', async () => {
    const audioDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tts-helper-audio-'));
    let streamlabsUrl: URL | null = null;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith('https://streamlabs.com')) {
        streamlabsUrl = new URL(url);
        return new Response(JSON.stringify({ speak_url: 'https://cdn.example/audio.mp3' }), { status: 200 });
      }

      return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
    });
    const service = new StreamlabsTtsService(audioDir, new LogService(openDatabase()), fetchMock as typeof fetch);
    const item = {
      id: 'item-1',
      username: 'Thornityco',
      text: 'hello world',
    } as QueueItemRecord;

    const audioPath = await service.generate(item, {
      voice: 'Ivy',
      language: 'US English',
      defaultCharacterLimit: 300,
    });

    expect(path.basename(audioPath)).toBe('item-1.mp3');
    expect(await fs.readFile(audioPath)).toEqual(Buffer.from([1, 2, 3]));
    expect(streamlabsUrl?.searchParams.get('text')).toBe('Thornityco says hello world');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
