import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AmazonPollyData,
  ChatPermissions,
  ChatState,
  ConfigFeature,
  GeneralChatState,
  GptPersonalityState,
  GptSettingsState,
  StreamElementsData,
  TtsType,
} from '../state/config/config.feature';
import { GlobalConfigActions } from '../state/config/config.actions';
import { PlaybackService } from './playback.service';

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
  public readonly gptEnabled$ = this.store.select(ConfigFeature.selectGptEnabled);
  public readonly gptChat$ = this.store.select(ConfigFeature.selectGptChat);
  public readonly gptPersonality$ = this.store.select(ConfigFeature.selectGptPersonality);
  public readonly gptSettings$ = this.store.select(ConfigFeature.selectGptSettings);
  public readonly gptToken$ = this.store.select(ConfigFeature.selectGptToken);
  public readonly authTokens$ = this.store.select(ConfigFeature.selectAuthTokens);

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

  updateGptPersonality(gptPersonality: Partial<GptPersonalityState>) {
    this.store.dispatch(GlobalConfigActions.updateGPTPersonality({ gptPersonality }));
  }

  updateGptSettings(gptSettings: Partial<GptSettingsState>) {
    this.store.dispatch(GlobalConfigActions.updateGPTSettings({ gptSettings }));
  }

  updateGptChat(gptChat: Partial<ChatState>) {
    this.store.dispatch(GlobalConfigActions.updateGPTChat({ gptChat }));
  }

  updateGeneralChat(generalChat: Partial<GeneralChatState>) {
    this.store.dispatch(GlobalConfigActions.updateGeneralChat({ generalChat }));
  }

  updateChatPermissions(permissions: Partial<ChatPermissions>, system: 'gpt' | 'general') {
    if (system === 'gpt') {
      this.store.dispatch(GlobalConfigActions.updateGPTChatPermissions({ permissions }));
    } else if (system === 'general') {
      this.store.dispatch(GlobalConfigActions.updateGeneralChatPermissions({ permissions }));
    }
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

  clearState() {
    this.store.dispatch(GlobalConfigActions.resetState());
  }
}
