import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { configFeature, TtsType } from '../state/config/config.feature';
import { GlobalConfigActions } from '../state/config/config.actions';

@Injectable()
export class ConfigService {
  public readonly configState$ = this.store.select(configFeature.selectGlobalConfigState);
  public readonly streamElements$ = this.store.select(configFeature.selectStreamElements);
  public readonly ttsMonster$ = this.store.select(configFeature.selectTtsMonster);
  public readonly amazonPolly$ = this.store.select(configFeature.selectAmazonPolly);
  public readonly tikTok$ = this.store.select(configFeature.selectTikTok);
  public readonly selectedDevice$ = this.store.select(configFeature.selectAudioDevice);
  public readonly deviceVolume$ = this.store.select(configFeature.selectDeviceVolume);
  public readonly configTts$ = this.store.select(configFeature.selectTts);
  public readonly configUrl$ = this.store.select(configFeature.selectUrl);
  public readonly bannedWords$ = this.store.select(configFeature.selectBannedWords);

  constructor(private readonly store: Store) {}

  updateBannedWords(bannedWords: string) {
    const words = bannedWords
      .split(',')
      .filter((w) => !!w)
      .map((w) => w.trim());

    this.store.dispatch(GlobalConfigActions.updateBannedWords({ bannedWords: words }));
  }

  updateStreamElementsLanguage(language: string) {
    this.store.dispatch(GlobalConfigActions.updateStreamElementsLanguage({ language }));
  }

  updateVoice(voice: string) {
    this.store.dispatch(GlobalConfigActions.updateStreamElementsVoice({ voice }));
  }

  updateAmazonPollyLanguage(language: string) {
    this.store.dispatch(GlobalConfigActions.updateAmazonPollyLanguage({ language }));
  }

  updateAmazonPollyRegion(region: string) {
    this.store.dispatch(GlobalConfigActions.updateAmazonPollyRegion({ region }));
  }

  updateAmazonPollyPoolId(poolId: string) {
    this.store.dispatch(GlobalConfigActions.updateAmazonPollyPoolId({ poolId }));
  }

  updateAmazonPollyVoice(voice: string) {
    this.store.dispatch(GlobalConfigActions.updateAmazonPollyVoice({ voice }));
  }

  updateTikTokVoice(voice: string) {
    this.store.dispatch(GlobalConfigActions.updateTikTokVoice({ voice }));
  }

  updateTikTokLanguage(language: string) {
    this.store.dispatch(GlobalConfigActions.updateTikTokLanguage({ language }));
  }

  updateTtsMonsterOverlayInfo(partial: {
    overlay: string;
    userId: string;
    key: string;
  }) {
    this.store.dispatch(GlobalConfigActions.updateTtsMonsterOverlay({ ...partial }));
  }

  updateTts(tts: TtsType) {
    this.store.dispatch(GlobalConfigActions.updateSelectedTts({ tts }));
  }

  updateSelectedDevice(audioDevice: number) {
    this.store.dispatch(GlobalConfigActions.updateSelectedAudioDevice({ audioDevice }));
  }

  updateDeviceVolume(deviceVolume: number) {
    this.store.dispatch(GlobalConfigActions.updateDeviceVolume({ deviceVolume }));
  }

  clearState() {
    this.store.dispatch(GlobalConfigActions.resetState());
  }
}
