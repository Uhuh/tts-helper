import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AmazonPollyData,
  ChatPermissions,
  ConfigFeature,
  GeneralChatState,
  StreamElementsData,
  TtsType,
} from '../state/config/config.feature';
import { GlobalConfigActions } from '../state/config/config.actions';
import { PlaybackService } from './playback.service';

@Injectable()
export class ConfigService {
  public readonly state$ = this.store.select(ConfigFeature.selectGlobalConfigState);
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
  public readonly authTokens$ = this.store.select(ConfigFeature.selectAuthTokens);
  public readonly audioDelay$ = this.store.select(ConfigFeature.selectAudioDelay);

  constructor(
    private readonly store: Store,
    private readonly playbackService: PlaybackService,
  ) {}

  updateVTSToken(vtsAuthToken: string) {
    this.store.dispatch(GlobalConfigActions.updateTokens({ tokens: { vtsAuthToken } }));
  }

  updateBannedWords(bannedWords: string) {
    const words = bannedWords
      .split(',')
      .filter((w) => !!w)
      .map((w) => w.trim());

    this.store.dispatch(GlobalConfigActions.updateBannedWords({ bannedWords: words }));
  }

  updateGeneralChat(generalChat: Partial<GeneralChatState>) {
    this.store.dispatch(GlobalConfigActions.updateGeneralChat({ generalChat }));
  }

  updateChatPermissions(permissions: Partial<ChatPermissions>) {
    this.store.dispatch(GlobalConfigActions.updateGeneralChatPermissions({ permissions }));
  }

  updateStreamElements(streamElements: Partial<StreamElementsData>) {
    this.store.dispatch(GlobalConfigActions.updateStreamElements({ streamElements }));
  }

  updateAmazonPolly(amazonPolly: Partial<AmazonPollyData>) {
    this.store.dispatch(GlobalConfigActions.updateAmazonPolly({ amazonPolly }));
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
    this.playbackService.setOutputDevice(audioDevice);

    this.store.dispatch(GlobalConfigActions.updateSelectedAudioDevice({ audioDevice }));
  }

  updateDeviceVolume(deviceVolume: number) {
    this.playbackService.setVolumeLevel(deviceVolume);

    this.store.dispatch(GlobalConfigActions.updateDeviceVolume({ deviceVolume }));
  }

  updateAudioDelay(audioDelay: number) {
    this.playbackService.setPlaybackState({ endDelay: audioDelay * 1000 });

    this.store.dispatch(GlobalConfigActions.updateAudioDelay({ audioDelay }));
  }

  clearState() {
    this.store.dispatch(GlobalConfigActions.resetState());
  }
}
