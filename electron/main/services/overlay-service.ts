import type { ObsSettings, QueueItemRecord } from '../../../src/shared/types';

export interface BrowserSourceSettings {
  browserSourceCaptionsEnabled: boolean;
  browserSourceAudioEnabled: boolean;
}

export interface OverlayEvent {
  id: 'tts-helper';
  event: 'add-captions' | 'remove-captions' | 'now-playing' | 'settings';
  itemId?: string;
  text?: string;
  username?: string;
  settings?: BrowserSourceSettings;
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
      itemId: item.id,
      text: item.text,
      username: item.username,
    });
    this.broadcast({
      id: 'tts-helper',
      event: 'add-captions',
      itemId: item.id,
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

  browserSourceSettings(settings: ObsSettings): void {
    this.broadcast({
      id: 'tts-helper',
      event: 'settings',
      settings: {
        browserSourceCaptionsEnabled: settings.browserSourceCaptionsEnabled,
        browserSourceAudioEnabled: settings.browserSourceAudioEnabled,
      },
    });
  }

  broadcast(event: OverlayEvent): void {
    const message = JSON.stringify(event);
    for (const send of this.senders) {
      send(message);
    }
  }
}

export function captionsHtml(port: number, settings: ObsSettings): string {
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
  <audio id="queue-audio" preload="none"></audio>
  <script>
    const caption = document.getElementById('caption');
    const queueAudio = document.getElementById('queue-audio');
    let browserSourceSettings = {
      browserSourceCaptionsEnabled: ${JSON.stringify(settings.browserSourceCaptionsEnabled)},
      browserSourceAudioEnabled: ${JSON.stringify(settings.browserSourceAudioEnabled)},
    };

    const applySettings = (nextSettings) => {
      browserSourceSettings = {
        ...browserSourceSettings,
        ...nextSettings,
      };

      if (!browserSourceSettings.browserSourceCaptionsEnabled) {
        clearCaption();
      }

      if (!browserSourceSettings.browserSourceAudioEnabled) {
        stopAudio();
      }
    };

    const showCaption = (text) => {
      if (!browserSourceSettings.browserSourceCaptionsEnabled) return;
      caption.textContent = text || '';
      caption.classList.add('visible');
    };

    const clearCaption = () => {
      caption.classList.remove('visible');
      caption.textContent = '';
    };

    const playAudio = (itemId) => {
      if (!browserSourceSettings.browserSourceAudioEnabled || !itemId) return;
      queueAudio.src = '/api/audio/' + encodeURIComponent(itemId) + '?t=' + Date.now();
      queueAudio.currentTime = 0;
      queueAudio.play().catch(() => undefined);
    };

    const stopAudio = () => {
      queueAudio.pause();
      queueAudio.removeAttribute('src');
      queueAudio.load();
    };

    const refreshSettings = async () => {
      try {
        const response = await fetch('/api/obs/settings', { cache: 'no-store' });
        if (!response.ok) return;
        applySettings(await response.json());
      } catch {
        // Keep the last known settings if the app is restarting.
      }
    };

    const connect = () => {
      const ws = new WebSocket('ws://127.0.0.1:${port}/obs/ws');
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.id !== 'tts-helper') return;
        if (data.event === 'settings' && data.settings) {
          applySettings(data.settings);
          return;
        }
        if (data.event === 'now-playing') {
          if (data.text) showCaption(data.text);
          playAudio(data.itemId);
          return;
        }
        if (data.event === 'add-captions' || data.event === 'now-playing') {
          if (data.text) showCaption(data.text);
        }
        if (data.event === 'remove-captions') {
          clearCaption();
          stopAudio();
        }
      };
      ws.onclose = () => setTimeout(connect, 1500);
      ws.onerror = () => ws.close();
    };
    applySettings(browserSourceSettings);
    refreshSettings();
    setInterval(refreshSettings, 5000);
    connect();
  </script>
</body>
</html>`;
}
