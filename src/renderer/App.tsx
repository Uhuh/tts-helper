import {
  Activity,
  Captions,
  History,
  ListMusic,
  Play,
  Radio,
  ScrollText,
  Settings,
  Twitch,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppState } from '../shared/types';
import { getTtsHelper, MISSING_DESKTOP_BRIDGE_MESSAGE } from './api';
import { HistoryView } from './components/HistoryView';
import { IntegrationsView } from './components/IntegrationsView';
import { LogsView } from './components/LogsView';
import { PlaybackHost } from './components/PlaybackHost';
import { QueueConsole } from './components/QueueConsole';
import { SettingsView } from './components/SettingsView';
import { TwitchView } from './components/TwitchView';

type ViewId = 'queues' | 'history' | 'twitch' | 'settings' | 'integrations' | 'logs';

const navItems: {
  id: ViewId;
  label: string;
  icon: typeof ListMusic;
}[] = [
  { id: 'queues', label: 'Queues', icon: ListMusic },
  { id: 'history', label: 'History', icon: History },
  { id: 'twitch', label: 'Twitch', icon: Twitch },
  { id: 'settings', label: 'TTS Settings', icon: Settings },
  { id: 'integrations', label: 'Integrations', icon: Captions },
  { id: 'logs', label: 'Logs', icon: ScrollText },
];

export function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [view, setView] = useState<ViewId>('queues');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const api = getTtsHelper();
    if (!api) {
      setState(null);
      setError(MISSING_DESKTOP_BRIDGE_MESSAGE);
      return;
    }

    try {
      setState(await api.getAppState());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    void refresh();
    return getTtsHelper()?.onStateChanged(setState);
  }, [refresh]);

  const content = useMemo(() => {
    if (!state) {
      return <div className="empty-state">{error ? 'Desktop bridge unavailable.' : 'Loading local queues...'}</div>;
    }

    switch (view) {
      case 'history':
        return <HistoryView state={state} refresh={refresh} />;
      case 'twitch':
        return <TwitchView state={state} refresh={refresh} />;
      case 'settings':
        return <SettingsView state={state} refresh={refresh} />;
      case 'integrations':
        return <IntegrationsView state={state} refresh={refresh} />;
      case 'logs':
        return <LogsView state={state} />;
      case 'queues':
      default:
        return <QueueConsole state={state} refresh={refresh} />;
    }
  }, [error, refresh, state, view]);
  const bridgeAvailable = getTtsHelper() !== null;

  return (
    <div className="app-shell">
      <PlaybackHost settings={state?.settings.tts} />
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Radio size={22} />
          </div>
          <div>
            <strong>TTS Helper</strong>
            <span>Local queue console</span>
          </div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? 'active' : ''}
                onClick={() => setView(item.id)}
                type="button"
                title={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{navItems.find((item) => item.id === view)?.label}</h1>
            <p>
              {state?.playback.currentItem
                ? `Playing ${state.playback.currentItem.username}: ${state.playback.currentItem.text}`
                : state?.playback.paused
                  ? 'Playback is paused'
                  : 'Ready'}
            </p>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              disabled={!bridgeAvailable}
              onClick={() => {
                void getTtsHelper()?.playNext();
              }}
              title="Play next"
              type="button"
            >
              <Play size={18} />
            </button>
            <button className="icon-button" onClick={refresh} title="Refresh" type="button">
              <Activity size={18} />
            </button>
          </div>
        </header>
        {error ? <div className="notice error">{error}</div> : null}
        {content}
      </main>
    </div>
  );
}
