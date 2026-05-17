import { Copy, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { AppState } from '../../shared/types';

interface Props {
  state: AppState;
  refresh(): Promise<void>;
}

export function IntegrationsView({ state, refresh }: Props) {
  const [obsEnabled, setObsEnabled] = useState(state.settings.obs.enabled);
  const [obsUrl, setObsUrl] = useState(state.settings.obs.url);
  const [obsPassword, setObsPassword] = useState(state.settings.obs.password);
  const [browserSourceCaptionsEnabled, setBrowserSourceCaptionsEnabled] = useState(state.settings.obs.browserSourceCaptionsEnabled);
  const [browserSourceAudioEnabled, setBrowserSourceAudioEnabled] = useState(state.settings.obs.browserSourceAudioEnabled);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(state.settings.discord.webhookUrl);
  const captionsUrl = 'http://127.0.0.1:12589/obs/captions';

  useEffect(() => {
    setObsEnabled(state.settings.obs.enabled);
    setObsUrl(state.settings.obs.url);
    setObsPassword(state.settings.obs.password);
    setBrowserSourceCaptionsEnabled(state.settings.obs.browserSourceCaptionsEnabled);
    setBrowserSourceAudioEnabled(state.settings.obs.browserSourceAudioEnabled);
    setDiscordWebhookUrl(state.settings.discord.webhookUrl);
  }, [state.settings.discord, state.settings.obs]);

  async function save(event: FormEvent) {
    event.preventDefault();
    await window.ttsHelper.updateSettings({
      obs: {
        enabled: obsEnabled,
        url: obsUrl,
        password: obsPassword,
        browserSourceCaptionsEnabled,
        browserSourceAudioEnabled,
      },
      discord: {
        webhookUrl: discordWebhookUrl,
      },
    });
    await refresh();
  }

  return (
    <div className="view-stack">
      <form className="panel form-grid" onSubmit={save}>
        <h2>OBS and Discord</h2>
        <label className="check-row">
          <input type="checkbox" checked={obsEnabled} onChange={(event) => setObsEnabled(event.target.checked)} />
          Capture OBS stream time
        </label>
        <label>
          OBS websocket URL
          <input value={obsUrl} onChange={(event) => setObsUrl(event.target.value)} />
        </label>
        <label>
          OBS password
          <input type="password" value={obsPassword} onChange={(event) => setObsPassword(event.target.value)} />
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={browserSourceCaptionsEnabled}
            onChange={(event) => setBrowserSourceCaptionsEnabled(event.target.checked)}
          />
          Show captions in OBS browser source
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={browserSourceAudioEnabled}
            onChange={(event) => setBrowserSourceAudioEnabled(event.target.checked)}
          />
          Play queue audio in OBS browser source
        </label>
        <label className="wide-field">
          Discord webhook URL
          <input value={discordWebhookUrl} onChange={(event) => setDiscordWebhookUrl(event.target.value)} type="password" />
        </label>
        <div className="form-actions">
          <button className="primary" type="submit">
            <Save size={17} />
            Save
          </button>
        </div>
      </form>
      <section className="panel">
        <h2>OBS browser source</h2>
        <div className="copy-row">
          <code>{captionsUrl}</code>
          <button onClick={() => navigator.clipboard.writeText(captionsUrl)} type="button">
            <Copy size={17} />
            Copy
          </button>
        </div>
      </section>
    </div>
  );
}
