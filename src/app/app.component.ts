import { Component, inject } from '@angular/core';
import { TwitchPubSub } from './shared/services/twitch-pubsub';
import { StorageService } from './shared/services/storage.service';
import { Store } from '@ngrx/store';
import { TwitchService } from './shared/services/twitch.service';
import { combineLatest, debounceTime } from 'rxjs';
import { ConfigService } from './shared/services/config.service';
import { PlaybackService } from './shared/services/playback.service';
import { TwitchState } from './shared/state/twitch/twitch.feature';
import { ConfigState } from './shared/state/config/config.feature';
import { TwitchStateActions } from './shared/state/twitch/twitch.actions';
import { GlobalConfigActions } from './shared/state/config/config.actions';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/components/nav/nav.component';
import { VTubeStudioService } from './shared/services/vtubestudio.service';
import { AzureSttService } from './shared/services/azure-stt.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AzureState } from './shared/state/azure/azure.feature';
import { AzureActions } from './shared/state/azure/azure.actions';
import { ElevenLabsService } from './shared/services/eleven-labs.service';
import { ElevenLabsState } from './shared/state/eleven-labs/eleven-labs.feature';
import { ElevenLabsActions } from './shared/state/eleven-labs/eleven-labs.actions';
import { VTubeStudioState } from './shared/state/vtubestudio/vtubestudio.feature.';
import { VTubeStudioActions } from './shared/state/vtubestudio/vtubestudio.actions';
import { OpenAIService } from './shared/services/openai.service';
import { OpenAIState } from './shared/state/openai/openai.feature';
import { OpenAIActions } from './shared/state/openai/openai.actions';
import { ObsWebSocketService } from './shared/services/obs-websocket.service';
import { StreamDeckWebSocketService } from './shared/services/streamdeck-websocket.service';
import { VStreamService } from './shared/services/vstream.service';
import { VStreamState } from './shared/state/vstream/vstream.feature';
import { VStreamActions } from './shared/state/vstream/vstream.actions';
import { VStreamPubSubService } from './shared/services/vstream-pubsub.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavComponent, RouterOutlet],
})
export class AppComponent {
  private readonly store = inject(Store);
  private readonly azureService = inject(AzureSttService);
  private readonly elevenLabsService = inject(ElevenLabsService);
  private readonly configService = inject(ConfigService);
  private readonly openAIService = inject(OpenAIService);
  private readonly obsSocketService = inject(ObsWebSocketService);
  private readonly streamDeckSocketService = inject(StreamDeckWebSocketService);
  private readonly playbackService = inject(PlaybackService);
  private readonly storageService = inject(StorageService);
  private readonly twitchPubSub = inject(TwitchPubSub);
  private readonly twitchService = inject(TwitchService);
  private readonly vtubeStudioService = inject(VTubeStudioService);
  private readonly vstreamService = inject(VStreamService);
  private readonly vstreamPubSub = inject(VStreamPubSubService);

  private readonly settingsLocation = '.settings.json';

  /**
   * @TODO - Figure out a better way to have the service come alive that isn't
   * just injecting it into the root of the app.
   */
  constructor() {
    combineLatest([
      this.storageService.getFromStore<ConfigState>(this.settingsLocation, 'config'),
      this.storageService.getFromStore<OpenAIState>(this.settingsLocation, 'openai'),
      this.storageService.getFromStore<TwitchState>(this.settingsLocation, 'twitch'),
      this.storageService.getFromStore<AzureState>(this.settingsLocation, 'azure'),
      this.storageService.getFromStore<ElevenLabsState>(this.settingsLocation, 'eleven-labs'),
      this.storageService.getFromStore<VTubeStudioState>(this.settingsLocation, 'vtube-studio'),
      this.storageService.getFromStore<VStreamState>(this.settingsLocation, 'vstream'),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([
        config,
        openai,
        twitch,
        azure,
        elevenLabs,
        vtubeStudio,
        vstream,
      ]) => {
        this.handleGlobalData(config);
        this.handleOpenAIData(openai);
        this.handleTwitchData(twitch);
        this.handleAzureData(azure);
        this.handleElevenLabsData(elevenLabs);
        this.handleVTubeStudioData(vtubeStudio);
        this.handleVStreamData(vstream);
      });

    /**
     * Handle saving the whole state to memory
     * Debounce to ignore multi updates so it can save "less" times than needed
     */

    this.configService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((state) => {
        this.storageService.saveToStore(this.settingsLocation, 'config', state);
      });

    this.twitchService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((state) => {
        this.storageService.saveToStore(this.settingsLocation, 'twitch', state);
      });

    this.azureService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => {
        this.storageService.saveToStore(this.settingsLocation, 'azure', state);
      });

    this.elevenLabsService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => {
        this.storageService.saveToStore(this.settingsLocation, 'eleven-labs', state);
      });

    this.vtubeStudioService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => {
        this.storageService.saveToStore(this.settingsLocation, 'vtube-studio', state);
      });

    this.openAIService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => {
        this.storageService.saveToStore(this.settingsLocation, 'openai', state);
      });

    this.vstreamService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => {
        this.storageService.saveToStore(this.settingsLocation, 'vstream', state);
      });
  }

  handleGlobalData(data: { value: ConfigState } | null) {
    if (!data || !data.value) {
      return;
    }

    // Setup user audio device and volume on startup.
    this.playbackService.setOutputDevice(data.value.audioDevice);
    this.playbackService.setVolumeLevel(data.value.deviceVolume);
    this.playbackService.setPlaybackState({
      endDelay: data.value.audioDelay * 1000,
    });

    this.store.dispatch(
      GlobalConfigActions.updateState({ configState: data.value }),
    );
  }

  handleOpenAIData(data: { value: OpenAIState } | null) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      OpenAIActions.updateState({ openAIState: data.value }),
    );
  }

  handleTwitchData(data: { value: TwitchState } | null) {
    if (!data || !data.value) {
      return this.twitchService.clearState();
    }

    this.store.dispatch(
      TwitchStateActions.updateState({ twitchState: data.value }),
    );
  }

  handleAzureData(data: { value: AzureState } | null) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      AzureActions.updateAzureState({ partialState: data.value }),
    );
  }

  handleElevenLabsData(data: { value: ElevenLabsState } | null) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      ElevenLabsActions.updateState({ partialState: data.value }),
    );
  }

  handleVTubeStudioData(data: { value: VTubeStudioState } | null) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      VTubeStudioActions.updateState({ partialState: data.value }),
    );
  }

  handleVStreamData(data: { value: VStreamState } | null) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      VStreamActions.updateState({ partialState: data.value }),
    );
  }
}
