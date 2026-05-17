import { LogIn, Save, Unplug } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { AppState } from '../../shared/types';

interface Props {
  state: AppState;
  refresh(): Promise<void>;
}

export function TwitchView({ state, refresh }: Props) {
  const twitch = state.settings.twitch;
  const [enabled, setEnabled] = useState(twitch.enabled);
  const [token, setToken] = useState(twitch.token);
  const [clientId, setClientId] = useState(twitch.clientId);
  const [oauthStatus, setOauthStatus] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(twitch.enabled);
    setToken(twitch.token);
    setClientId(twitch.clientId);
  }, [twitch]);

  async function save(event: FormEvent) {
    event.preventDefault();
    await window.ttsHelper.updateSettings({
      twitch: {
        enabled,
        token,
        clientId,
      },
    });
    await refresh();
  }

  async function connect() {
    try {
      setOauthStatus(null);
      const oauth = await window.ttsHelper.startTwitchOAuth({ clientId });
      setOauthStatus(`Opened Twitch activation. Enter code ${oauth.userCode}.`);
    } catch (error) {
      setOauthStatus(error instanceof Error ? error.message : String(error));
    }
  }

  async function disconnect() {
    try {
      setOauthStatus(null);
      await window.ttsHelper.disconnectTwitch();
      await refresh();
      setOauthStatus('Twitch disconnected.');
    } catch (error) {
      setOauthStatus(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <form className="panel form-grid" onSubmit={save}>
      <h2>Twitch</h2>
      <label className="check-row">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        Enabled
      </label>
      <label>
        Channel
        <input value={twitch.channelName || 'Not connected'} disabled />
      </label>
      <label>
        Token expires
        <input value={twitch.tokenExpiresAt ? new Date(twitch.tokenExpiresAt).toLocaleString() : 'Not connected'} disabled />
      </label>
      <label>
        Client ID
        <input value={clientId} onChange={(event) => setClientId(event.target.value)} />
      </label>
      <label className="wide-field">
        OAuth token
        <input value={token} onChange={(event) => setToken(event.target.value)} type="password" />
      </label>
      <div className="form-actions wide-field">
        <button onClick={connect} type="button">
          <LogIn size={17} />
          Connect Twitch
        </button>
        <button onClick={disconnect} type="button">
          <Unplug size={17} />
          Disconnect
        </button>
      </div>
      {oauthStatus ? <div className="notice wide-field">{oauthStatus}</div> : null}
      <div className="form-actions">
        <button className="primary" type="submit">
          <Save size={17} />
          Save
        </button>
      </div>
    </form>
  );
}
