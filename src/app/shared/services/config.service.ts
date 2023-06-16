import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectAmazonPolly,
  selectAudioDevice,
  selectBannedWords,
  selectConfigState,
  selectDeviceVolume,
  selectStreamElements,
  selectTikTok,
  selectTts,
  selectTtsMonster,
  selectUrl,
} from '../state/config/config.selectors';
import {
  configInfo,
  amazonPollyInfo,
  streamElementsInfo,
  updateTtsMonsterOverlayInfo,
  tikTokInfo,
} from '../state/config/config.actions';
import { TtsType } from '../state/config/config.interface';
import { initialState } from '../state/config/config.reducers';

@Injectable()
export class ConfigService {
  public readonly configState$ = this.store.select(selectConfigState);
  public readonly streamElements$ = this.store.select(selectStreamElements);
  public readonly ttsMonster$ = this.store.select(selectTtsMonster);
  public readonly amazonPolly$ = this.store.select(selectAmazonPolly);
  public readonly tikTok$ = this.store.select(selectTikTok);
  public readonly selectedDevice$ = this.store.select(selectAudioDevice);
  public readonly deviceVolume$ = this.store.select(selectDeviceVolume);
  public readonly configTts$ = this.store.select(selectTts);
  public readonly configUrl$ = this.store.select(selectUrl);
  public readonly bannedWords$ = this.store.select(selectBannedWords);

  constructor(private readonly store: Store) {}

  updateBannedWords(bannedWords: string) {
    const words = bannedWords
      .split(',')
      .filter((w) => !!w)
      .map((w) => w.trim());

    this.store.dispatch(configInfo.bannedWords({ bannedWords: words }));
  }

  updateStreamElementsLanguage(language: string) {
    this.store.dispatch(streamElementsInfo.language({ language }));
  }

  updateVoice(voice: string) {
    this.store.dispatch(streamElementsInfo.voice({ voice }));
  }

  updateAmazonPollyLanguage(language: string) {
    this.store.dispatch(amazonPollyInfo.language({ language }));
  }

  updateAmazonPollyRegion(region: string) {
    this.store.dispatch(amazonPollyInfo.region({ region }));
  }

  updateAmazonPollyPoolId(poolId: string) {
    this.store.dispatch(amazonPollyInfo.poolId({ poolId }));
  }

  updateAmazonPollyVoice(voice: string) {
    this.store.dispatch(amazonPollyInfo.voice({ voice }));
  }

  updateTikTokVoice(voice: string) {
    this.store.dispatch(tikTokInfo.voice({ voice }));
  }

  updateTikTokLanguage(language: string) {
    this.store.dispatch(tikTokInfo.language({ language }));
  }

  updateTtsMonsterOverlayInfo(partial: {
    overlay: string;
    userId: string;
    key: string;
  }) {
    this.store.dispatch(updateTtsMonsterOverlayInfo({ ...partial }));
  }

  updateTts(tts: TtsType) {
    this.store.dispatch(configInfo.tts({ tts }));
  }

  updateSelectedDevice(audioDevice: string) {
    this.store.dispatch(configInfo.audioDevice({ audioDevice }));
  }

  updateDeviceVolume(deviceVolume: number) {
    this.store.dispatch(configInfo.deviceVolume({ deviceVolume }));
  }

  clearState() {
    this.store.dispatch(
      configInfo.configState({
        configState: initialState,
      })
    );
  }
}
