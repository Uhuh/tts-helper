import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AmazonPollyData,
  ConfigFeature,
  CustomUserVoice,
  GeneralChatState,
  MultiVoice,
  StreamElementsData,
  TtsType,
} from '../state/config/config.feature';
import { GlobalConfigActions } from '../state/config/config.actions';
import { PlaybackService } from './playback.service';
import { ChatPermissions } from './chat.interface';

@Injectable()
export class ConfigService {
  private readonly store = inject(Store);
  private readonly playbackService = inject(PlaybackService);
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
  public readonly audioSettings$ = this.store.select(ConfigFeature.selectAudioSettings);
  public readonly userListState$ = this.store.select(ConfigFeature.selectUserListState);
  public readonly customUserVoices$ = this.store.select(ConfigFeature.selectCustomUserVoices);
  public readonly customUserVoiceRedeem$ = this.store.select(ConfigFeature.selectCustomUserVoiceRedeem);
  public readonly multiVoices$ = this.store.select(ConfigFeature.selectMultiVoices);

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

  updateUserList(userListSettings: { usernames: string, shouldBlockUser: boolean }) {
    const usernames = userListSettings.usernames.toLowerCase().split(',').filter(u => !!u).map(u => u.trim());

    this.store.dispatch(GlobalConfigActions.updateUserList({
      userListState: {
        usernames,
        shouldBlockUser: userListSettings.shouldBlockUser,
      },
    }));
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

  createCustomUserVoice(partialSettings?: Partial<CustomUserVoice>) {
    this.store.dispatch(GlobalConfigActions.createCustomUserVoice({ partialSettings }));
  }

  updateCustomUserVoice(id: string, partialSettings: Partial<CustomUserVoice>) {
    this.store.dispatch(GlobalConfigActions.updateCustomUserVoice({ id, partialSettings }));
  }

  deleteCustomUserVoice(id: string) {
    this.store.dispatch(GlobalConfigActions.deleteCustomUserVoice({ id }));
  }

  updateCustomUserVoiceRedeem(redeem: string) {
    this.store.dispatch(GlobalConfigActions.updateCustomUserVoiceRedeem({ redeem }));
  }

  createMultiVoice(partialSettings?: Partial<MultiVoice>) {
    this.store.dispatch(GlobalConfigActions.createMultiVoice({ partialSettings }));
  }

  updateMultiVoice(id: string, partialSettings: Partial<MultiVoice>) {
    this.store.dispatch(GlobalConfigActions.updateMultiVoice({ id, partialSettings }));
  }

  deleteMultiVoice(id: string) {
    this.store.dispatch(GlobalConfigActions.deleteMultiVoice({ id }));
  }

  clearState() {
    this.store.dispatch(GlobalConfigActions.resetState());
  }
}
