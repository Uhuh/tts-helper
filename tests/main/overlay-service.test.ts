import { describe, expect, it, vi } from 'vitest';
import { OverlayService, captionsHtml } from '../../electron/main/services/overlay-service';

describe('OverlayService', () => {
  it('broadcasts browser source settings without OBS connection details', () => {
    const overlay = new OverlayService();
    const send = vi.fn();
    overlay.addClient(send);

    overlay.browserSourceSettings({
      enabled: true,
      url: 'ws://obs.example',
      password: 'secret',
      browserSourceCaptionsEnabled: false,
      browserSourceAudioEnabled: true,
    });

    expect(send).toHaveBeenCalledWith(JSON.stringify({
      id: 'tts-helper',
      event: 'settings',
      settings: {
        browserSourceCaptionsEnabled: false,
        browserSourceAudioEnabled: true,
      },
    }));
  });

  it('renders browser source audio and settings refresh hooks', () => {
    const html = captionsHtml(12589, {
      enabled: false,
      url: 'ws://127.0.0.1:4455',
      password: '',
      browserSourceCaptionsEnabled: false,
      browserSourceAudioEnabled: true,
    });

    expect(html).toContain('queue-audio');
    expect(html).toContain('/api/audio/');
    expect(html).toContain('/api/obs/settings');
    expect(html).toContain('browserSourceCaptionsEnabled: false');
    expect(html).toContain('browserSourceAudioEnabled: true');
  });
});
