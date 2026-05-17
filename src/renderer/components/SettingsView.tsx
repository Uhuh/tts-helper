import { Save } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { AppState } from '../../shared/types';

interface Props {
  state: AppState;
  refresh(): Promise<void>;
}

export function SettingsView({ state, refresh }: Props) {
  const [voice, setVoice] = useState(state.settings.tts.voice);
  const [language, setLanguage] = useState(state.settings.tts.language);
  const [defaultCharacterLimit, setDefaultCharacterLimit] = useState(state.settings.tts.defaultCharacterLimit);

  async function save(event: FormEvent) {
    event.preventDefault();
    await window.ttsHelper.updateSettings({
      tts: {
        voice,
        language,
        defaultCharacterLimit,
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
      <div className="form-actions">
        <button className="primary" type="submit">
          <Save size={17} />
          Save
        </button>
      </div>
    </form>
  );
}
