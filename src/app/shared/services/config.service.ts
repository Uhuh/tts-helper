import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectBannedWords,
  selectVoiceSettings,
} from '../state/config/config.selectors';
import { updateBannedWords } from '../state/config/config.actions';

@Injectable()
export class ConfigService {
  public readonly voiceSettings$ = this.store.select(selectVoiceSettings);
  public readonly bannedWords$ = this.store.select(selectBannedWords);

  /**
   * @TODO - Need to get saving settings to appdata soon
   */
  constructor(private readonly store: Store) {}

  updateBannedWords(bannedWords: string) {
    const words = bannedWords
      .split(',')
      .filter((w) => !!w)
      .map((w) => w.trim());

    this.store.dispatch(updateBannedWords({ bannedWords: words }));
  }
}
