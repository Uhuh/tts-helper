import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectBannedWords,
  selectConfigState,
  selectStreamElements,
  selectTtsMonster,
  selectVoiceSettings,
  selectVoiceSettingsTts,
} from '../state/config/config.selectors';
import {
  updateBannedWords,
  updateConfigState,
  updateLanguage,
  updateTts,
  updateTtsMonsterAi,
  updateTtsMonsterOverlayInfo,
  updateUrl,
  updateVoice,
} from '../state/config/config.actions';
import { TtsType, TtsUrlMap } from '../state/config/config.interface';

@Injectable()
export class ConfigService {
  public readonly configState$ = this.store.select(selectConfigState);
  public readonly voiceSettings$ = this.store.select(selectVoiceSettings);
  public readonly streamElements$ = this.store.select(selectStreamElements);
  public readonly ttsMonster$ = this.store.select(selectTtsMonster);
  public readonly voiceSettingsTts$ = this.store.select(selectVoiceSettingsTts);
  public readonly bannedWords$ = this.store.select(selectBannedWords);

  constructor(private readonly store: Store) {}

  updateBannedWords(bannedWords: string) {
    const words = bannedWords
      .split(',')
      .filter((w) => !!w)
      .map((w) => w.trim());

    this.store.dispatch(updateBannedWords({ bannedWords: words }));
  }

  updateLanguage(language: string) {
    this.store.dispatch(updateLanguage({ language }));
  }

  updateVoice(voice: string) {
    this.store.dispatch(updateVoice({ voice }));
  }

  updateTtsMonsterAi(ai: boolean) {
    this.store.dispatch(updateTtsMonsterAi({ ai }));
  }

  updateTtsMonsterOverlayInfo(partial: {
    overlay: string;
    userId: string;
    key: string;
  }) {
    this.store.dispatch(updateTtsMonsterOverlayInfo({ ...partial }));
  }

  updateTts(tts: TtsType) {
    this.store.dispatch(updateTts({ tts }));
  }

  updateUrl(tts: TtsType) {
    this.store.dispatch(updateUrl({ url: TtsUrlMap[tts] }));
  }

  clearState() {
    this.store.dispatch(
      updateConfigState({
        configState: {
          bannedWords: [],
          voiceSettings: {
            tts: 'stream-elements',
            url: 'https://api.streamelements.com/kappa/v2/speech',
            streamElements: {
              language: '',
              voice: '',
            },
            ttsMonster: {
              overlay: '',
              userId: '',
              key: '',
              message: '',
              ai: false,
              details: {
                provider: 'tts-helper',
              },
            },
          },
        },
      })
    );
  }
}
