import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChatPermissions, ConfigFeature, TtsType } from '../state/config/config.feature';
import { GlobalConfigActions } from '../state/config/config.actions';

@Injectable()
export class ConfigService {
  public readonly configState$ = this.store.select(ConfigFeature.selectGlobalConfigState);
  public readonly streamElements$ = this.store.select(ConfigFeature.selectStreamElements);
  public readonly ttsMonster$ = this.store.select(ConfigFeature.selectTtsMonster);
  public readonly amazonPolly$ = this.store.select(ConfigFeature.selectAmazonPolly);
  public readonly tikTok$ = this.store.select(ConfigFeature.selectTikTok);
  public readonly selectedDevice$ = this.store.select(ConfigFeature.selectAudioDevice);
  public readonly deviceVolume$ = this.store.select(ConfigFeature.selectDeviceVolume);
  public readonly configTts$ = this.store.select(ConfigFeature.selectTts);
  public readonly configUrl$ = this.store.select(ConfigFeature.selectUrl);
  public readonly bannedWords$ = this.store.select(ConfigFeature.selectBannedWords);
  public readonly generalChat$ = this.store.select(ConfigFeature.selectGeneralChat);
  public readonly gptChat$ = this.store.select(ConfigFeature.selectGptChat);
  
  constructor(private readonly store: Store) {}

  updateBannedWords(bannedWords: string) {
    const words = bannedWords
      .split(',')
      .filter((w) => !!w)
      .map((w) => w.trim());

    this.store.dispatch(GlobalConfigActions.updateBannedWords({ bannedWords: words }));
  }
  
  updateChatPermissions(permissions: Partial<ChatPermissions>, system: 'gpt' | 'general') {
    if (system === 'gpt') {
      this.store.dispatch(GlobalConfigActions.updateGPTChatPermissions({ permissions }));
    } else if (system === 'general') {
      this.store.dispatch(GlobalConfigActions.updateGeneralChatPermissions({ permissions }));
    }
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
