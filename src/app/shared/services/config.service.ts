import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectAmazonPolly,
  selectBannedWords,
  selectConfigState,
  selectStreamElements,
  selectTts,
  selectTtsMonster,
  selectUrl,
} from '../state/config/config.selectors';
import {
  updateAmazonPollyLanguage, updateAmazonPollyPoolId, updateAmazonPollyRegion, updateAmazonPollyVoice,
  updateBannedWords,
  updateConfigState,
  updateStreamElementsLanguage,
  updateTts,
  updateTtsMonsterOverlayInfo,
  updateUrl,
  updateVoice,
} from '../state/config/config.actions';
import { TtsType, TtsUrlMap } from '../state/config/config.interface';

@Injectable()
export class ConfigService {
  public readonly configState$ = this.store.select(selectConfigState);
  public readonly streamElements$ = this.store.select(selectStreamElements);
  public readonly ttsMonster$ = this.store.select(selectTtsMonster);
  public readonly amazonPolly$ = this.store.select(selectAmazonPolly);
  public readonly configTts$ = this.store.select(selectTts);
  public readonly configUrl$ = this.store.select(selectUrl);
  public readonly bannedWords$ = this.store.select(selectBannedWords);

  constructor(private readonly store: Store) {}

  updateBannedWords(bannedWords: string) {
    const words = bannedWords
      .split(',')
      .filter((w) => !!w)
      .map((w) => w.trim());

    this.store.dispatch(updateBannedWords({ bannedWords: words }));
  }

  updateStreamElementsLanguage(language: string) {
    this.store.dispatch(updateStreamElementsLanguage({ language }));
  }

  updateAmazonPollyLanguage(language: string) {
    this.store.dispatch(updateAmazonPollyLanguage({ language }));
  }
  
  updateAmazonPollyRegion(region: string) {
    this.store.dispatch(updateAmazonPollyRegion({ region }));
  }

  updateAmazonPollyPoolId(poolId: string) {
    this.store.dispatch(updateAmazonPollyPoolId({ poolId }));
  }

  updateAmazonPollyVoice(voice: string) {
    this.store.dispatch(updateAmazonPollyVoice({ voice }));
  }
  
  updateVoice(voice: string) {
    this.store.dispatch(updateVoice({ voice }));
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
          amazonPolly: {
            voice: '',
            language: '',
            poolId: '',
            region: '',
          },
        },
      })
    );
  }
}
