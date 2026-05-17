import Fastify, { type FastifyInstance } from 'fastify';
import type { InjectOptions, LightMyRequestResponse } from 'fastify';
import fs from 'node:fs';
import { WebSocketServer, type WebSocket } from 'ws';
import { z } from 'zod';
import type { AppService } from './app-service';
import type { LogService } from './log-service';
import { captionsHtml, type OverlayService } from './overlay-service';
import type { PlaybackService } from './playback-service';

const ttsBodySchema = z.object({
  text: z.string().min(1),
  username: z.string().default('API'),
  source: z.string().default('api'),
  queueId: z.string().optional(),
  actionType: z.string().default('api'),
  actionId: z.string().nullable().optional(),
  char_limit: z.number().int().positive().optional(),
  priority: z.number().int().optional(),
});

const twitchOAuthBodySchema = z.object({
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  state: z.string().min(1),
  expires_in: z.coerce.number().int().positive().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export class LocalApiServer {
  private fastify: FastifyInstance | null = null;
  private wsServer: WebSocketServer | null = null;
  private actualPort = 12589;

  constructor(
    private readonly appService: AppService,
    private readonly playback: PlaybackService,
    private readonly overlay: OverlayService,
    private readonly logs: LogService,
    private readonly port = 12589,
  ) {}

  get portInUse(): number {
    return this.actualPort;
  }

  async start(): Promise<void> {
    if (this.fastify) {
      return;
    }

    const fastify = this.createFastify();

    await fastify.listen({ host: '127.0.0.1', port: this.port });
    const address = fastify.server.address();
    if (typeof address === 'object' && address?.port) {
      this.actualPort = address.port;
    }

    this.attachWebSocketServer(fastify);

    this.logs.add('info', 'LocalApiServer.start', `Listening on http://127.0.0.1:${this.actualPort}.`);
  }

  async inject(options: InjectOptions): Promise<LightMyRequestResponse> {
    const fastify = this.fastify ?? this.createFastify();
    return fastify.inject(options);
  }

  async stop(): Promise<void> {
    this.wsServer?.close();
    this.wsServer = null;
    await this.fastify?.close();
    this.fastify = null;
  }

  private createFastify(): FastifyInstance {
    const fastify = Fastify({ logger: false });
    this.fastify = fastify;

    fastify.get('/health', async () => ({ ok: true }));
    fastify.get('/obs/captions', async (_request, reply) => {
      return reply.type('text/html').send(captionsHtml(this.actualPort, this.appService.getState().settings.obs));
    });
    fastify.get('/api/obs/settings', async () => {
      const { browserSourceCaptionsEnabled, browserSourceAudioEnabled } = this.appService.getState().settings.obs;
      return {
        browserSourceCaptionsEnabled,
        browserSourceAudioEnabled,
      };
    });
    fastify.get<{ Params: { itemId: string } }>('/api/audio/:itemId', async (request, reply) => {
      const audioPath = this.appService.getAudioPath(request.params.itemId);

      if (!audioPath || !fs.existsSync(audioPath)) {
        return reply.status(404).send({ error: 'Audio file not found.' });
      }

      return reply
        .type('audio/mpeg')
        .header('Cache-Control', 'no-store')
        .send(fs.createReadStream(audioPath));
    });
    fastify.get('/twitch/oauth/callback', async (_request, reply) => {
      return reply.type('text/html').send(twitchOAuthCallbackHtml());
    });

    fastify.post('/api/tts', async (request, reply) => {
      const body = ttsBodySchema.parse(request.body);
      const item = await this.appService.enqueue({
        text: body.text,
        username: body.username,
        source: body.source,
        queueId: body.queueId,
        actionType: body.actionType,
        actionId: body.actionId,
        charLimit: body.char_limit,
        priority: body.priority,
      });

      return reply.send(item);
    });

    fastify.post('/api/playback/stop-current', async () => this.playback.stopCurrent());
    fastify.post('/api/playback/skip-current', async () => this.playback.skipCurrent());
    fastify.post('/api/playback/play-next', async () => this.playback.playNext());
    fastify.post('/api/playback/pause', async () => this.playback.pause());
    fastify.post('/api/playback/resume', async () => this.playback.resume());

    fastify.post('/api/twitch/oauth/complete', async (request, reply) => {
      const body = twitchOAuthBodySchema.parse(request.body);
      const settings = await this.appService.completeTwitchOAuth({
        accessToken: body.access_token,
        tokenType: body.token_type,
        scope: body.scope,
        state: body.state,
        expiresIn: body.expires_in,
        error: body.error,
        errorDescription: body.error_description,
      });

      return reply.send(settings.twitch);
    });

    return fastify;
  }

  private attachWebSocketServer(fastify: FastifyInstance): void {
    const wsServer = new WebSocketServer({ noServer: true });
    this.wsServer = wsServer;

    wsServer.on('connection', (socket: WebSocket) => {
      const remove = this.overlay.addClient((message) => {
        if (socket.readyState === socket.OPEN) {
          socket.send(message);
        }
      });
      socket.on('close', remove);
    });

    fastify.server.on('upgrade', (request, socket, head) => {
      if (request.url !== '/obs/ws') {
        return;
      }

      wsServer.handleUpgrade(request, socket, head, (client) => {
        wsServer.emit('connection', client, request);
      });
    });
  }
}

function twitchOAuthCallbackHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TTS Helper Twitch OAuth</title>
    <style>
      body {
        align-items: center;
        background: #101418;
        color: #e7edf3;
        display: flex;
        font-family: system-ui, sans-serif;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
      }
      main {
        max-width: 520px;
        padding: 32px;
        text-align: center;
      }
      h1 { font-size: 22px; }
      p { color: #aeb8c2; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>Connecting Twitch...</h1>
      <p id="status">Finishing authorization with TTS Helper.</p>
    </main>
    <script>
      const status = document.getElementById('status');
      const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const query = new URLSearchParams(window.location.search.replace(/^\\?/, ''));
      const payload = Object.fromEntries([...query.entries(), ...fragment.entries()]);

      fetch('/api/twitch/oauth/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        status.textContent = 'Twitch connected. You can close this window.';
      }).catch((error) => {
        status.textContent = error instanceof Error ? error.message : String(error);
      });
    </script>
  </body>
</html>`;
}
