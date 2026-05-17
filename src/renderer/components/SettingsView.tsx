import { RefreshCw, Save } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { AppState } from '../../shared/types';

interface Props {
  state: AppState;
  refresh(): Promise<void>;
}

export function SettingsView({ state, refresh }: Props) {
  const [voice, setVoice] = useState(state.settings.tts.voice);
  const [language, setLanguage] = useState(state.settings.tts.language);
  const [defaultCharacterLimit, setDefaultCharacterLimit] = useState(state.settings.tts.defaultCharacterLimit);
  const [monitorAudioEnabled, setMonitorAudioEnabled] = useState(state.settings.tts.monitorAudioEnabled);
  const [monitorOutputDeviceId, setMonitorOutputDeviceId] = useState(state.settings.tts.monitorOutputDeviceId);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    setVoice(state.settings.tts.voice);
    setLanguage(state.settings.tts.language);
    setDefaultCharacterLimit(state.settings.tts.defaultCharacterLimit);
    setMonitorAudioEnabled(state.settings.tts.monitorAudioEnabled);
    setMonitorOutputDeviceId(state.settings.tts.monitorOutputDeviceId);
  }, [state.settings.tts]);

  async function refreshAudioOutputs() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setAudioOutputs([]);
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    setAudioOutputs(devices.filter((device) => device.kind === 'audiooutput'));
  }

  useEffect(() => {
    void refreshAudioOutputs();
  }, []);

  const outputOptions = useMemo(() => {
    const seen = new Set(['default']);
    return [
      { id: 'default', label: 'System default' },
      ...audioOutputs
        .filter((device) => {
          if (seen.has(device.deviceId)) {
            return false;
          }

          seen.add(device.deviceId);
          return true;
        })
        .map((device, index) => ({
          id: device.deviceId,
          label: device.label || `Audio output ${index + 1}`,
        })),
    ];
  }, [audioOutputs]);

  async function save(event: FormEvent) {
    event.preventDefault();
    await window.ttsHelper.updateSettings({
      tts: {
        voice,
        language,
        defaultCharacterLimit,
        monitorAudioEnabled,
        monitorOutputDeviceId,
      },
    });
    await refresh();
  }

  return (
    <form className="panel form-grid" onSubmit={save}>
      <h2>Streamlabs TTS</h2>
      <label>
        Language
        <input value={language} onChange={(event) => setLanguage(event.target.value)} />
      </label>
      <label>
        Voice
        <input value={voice} onChange={(event) => setVoice(event.target.value)} />
      </label>
      <label>
        Default character limit
        <input
          type="number"
          min={1}
          value={defaultCharacterLimit}
          onChange={(event) => setDefaultCharacterLimit(Number(event.target.value))}
        />
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={monitorAudioEnabled}
          onChange={(event) => setMonitorAudioEnabled(event.target.checked)}
        />
        Monitor queue audio in this app
      </label>
      <label>
        Monitor output
        <select value={monitorOutputDeviceId} onChange={(event) => setMonitorOutputDeviceId(event.target.value)}>
          {outputOptions.map((device) => (
            <option key={device.id} value={device.id}>
              {device.label}
            </option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button onClick={() => { void refreshAudioOutputs(); }} type="button">
          <RefreshCw size={17} />
          Refresh devices
        </button>
        <button className="primary" type="submit">
          <Save size={17} />
          Save
        </button>
      </div>
    </form>
  );
}
