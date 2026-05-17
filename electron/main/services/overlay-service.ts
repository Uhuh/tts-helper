import type { QueueItemRecord } from '../../../src/shared/types';

export interface OverlayEvent {
  id: 'tts-helper';
  event: 'add-captions' | 'remove-captions' | 'now-playing';
  text?: string;
  username?: string;
}

export class OverlayService {
  private readonly senders = new Set<(message: string) => void>();

  addClient(sender: (message: string) => void): () => void {
    this.senders.add(sender);
    return () => this.senders.delete(sender);
  }

  nowPlaying(item: QueueItemRecord): void {
    this.broadcast({
      id: 'tts-helper',
      event: 'now-playing',
      text: item.text,
      username: item.username,
    });
    this.broadcast({
      id: 'tts-helper',
      event: 'add-captions',
      text: item.text,
      username: item.username,
    });
  }

  clearCaptions(): void {
    this.broadcast({
      id: 'tts-helper',
      event: 'remove-captions',
    });
  }

  broadcast(event: OverlayEvent): void {
    const message = JSON.stringify(event);
    for (const send of this.senders) {
      send(message);
    }
  }
}

export function captionsHtml(port: number): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TTS Helper Captions</title>
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      overflow: hidden;
      font-family: Inter, Arial, sans-serif;
    }
    #caption {
      display: inline-flex;
      max-width: min(760px, 90vw);
      padding: 12px 16px;
      border: 2px solid rgba(255, 255, 255, 0.88);
      border-radius: 8px;
      background: rgba(17, 24, 39, 0.78);
      color: white;
      font-size: 24px;
      line-height: 1.35;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 160ms ease, transform 160ms ease;
      overflow-wrap: anywhere;
    }
    #caption.visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div id="caption"></div>
  <script>
    const caption = document.getElementById('caption');
    const connect = () => {
      const ws = new WebSocket('ws://127.0.0.1:${port}/obs/ws');
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.id !== 'tts-helper') return;
        if (data.text) caption.textContent = data.text;
        if (data.event === 'add-captions' || data.event === 'now-playing') {
          caption.classList.add('visible');
        }
        if (data.event === 'remove-captions') {
          caption.classList.remove('visible');
        }
      };
      ws.onclose = () => setTimeout(connect, 1500);
      ws.onerror = () => ws.close();
    };
    connect();
  </script>
</body>
</html>`;
}
