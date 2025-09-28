import { Component, DestroyRef, effect, inject } from '@angular/core';
import { TwitchPubSub } from './shared/services/twitch-pubsub';
import { Store } from '@ngrx/store';
import { TwitchService } from './shared/services/twitch.service';
import { combineLatest, debounceTime, first, from, map } from 'rxjs';
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
import { CounterCommand } from './shared/services/command.interface';
import { AppSettingsService } from './shared/services/app-settings.service';
import { AppSettingsActions, AppSettingsFeatureState } from './shared/state/app-settings/app-settings.feature';
import { load } from '@tauri-apps/plugin-store';
import { WatchStreakFeatureState } from './shared/state/watch-streak/watch-streak.feature';
import { WatchStreakActions } from './shared/state/watch-streak/watch-streak.actions';
import { ChatService } from './shared/services/chat.service';
import { YoutubeService } from './shared/services/youtube.service';
import { YoutubeFeatureState } from './shared/state/youtube/youtube.feature';
import { VirtualMotionCaptureProtocolService } from "./shared/services/virtual-motion-capture-protocol.service";
import { VirtualMotionCaptureState } from "./shared/state/virtual-motion-capture/virtual-motion-capture.feature";
import { TtsHelperApiService } from "./shared/services/tts-helper-api.service";
import { TtsHelperApiFeatureState } from "./shared/state/api/tts-helper-api.feature";

async function saveToStore<T>(file: string, key: string, data: T) {
  const store = await load(file);

  await store.set(key, { value: data });
  await store.save();
}

async function getFromStore<T>(file: string, key: string): Promise<{ value: T } | undefined> {
  const store = await load(file);

  console.log();

  return store.get<{ value: T }>(key);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NavComponent, RouterOutlet],
})
export class AppComponent {
  private readonly store = inject(Store);
  private readonly appSettingsService = inject(AppSettingsService);
  private readonly azureService = inject(AzureSttService);
  private readonly elevenLabsService = inject(ElevenLabsService);
  private readonly chatService = inject(ChatService);
  private readonly configService = inject(ConfigService);
  private readonly openAIService = inject(OpenAIService);
  private readonly obsSocketService = inject(ObsWebSocketService);
  private readonly streamDeckSocketService = inject(StreamDeckWebSocketService);
  private readonly playbackService = inject(PlaybackService);
  private readonly twitchPubSub = inject(TwitchPubSub);
  private readonly twitchService = inject(TwitchService);
  private readonly apiService = inject(TtsHelperApiService);
  private readonly vtubeStudioService = inject(VTubeStudioService);
  private readonly vstreamService = inject(VStreamService);
  private readonly vstreamPubSub = inject(VStreamPubSubService);
  private readonly youtubeService = inject(YoutubeService);
  private readonly virtualMotionCaptureService = inject(VirtualMotionCaptureProtocolService);

  private readonly destroyRef = inject(DestroyRef);

  private readonly settingsLocation = '.settings.json';

  /**
   * @TODO - Figure out a better way to have the service come alive that isn't
   * just injecting it into the root of the app.
   */
  constructor() {
    combineLatest({
      config: from(getFromStore<ConfigState>(this.settingsLocation, 'config')),
      openai: from(getFromStore<OpenAIState>(this.settingsLocation, 'openai')),
      twitch: from(getFromStore<TwitchState>(this.settingsLocation, 'twitch')),
      azure: from(getFromStore<AzureState>(this.settingsLocation, 'azure')),
      elevenLabs: from(getFromStore<ElevenLabsState>(this.settingsLocation, 'eleven-labs')),
      vtubeStudio: from(getFromStore<VTubeStudioState>(this.settingsLocation, 'vtube-studio')),
      vstream: from(getFromStore<VStreamState>(this.settingsLocation, 'vstream')),
      virtualMotionCapture: from(getFromStore<VirtualMotionCaptureState>(this.settingsLocation, 'virtual-motion-capture')),
      appSettings: from(getFromStore<AppSettingsFeatureState>(this.settingsLocation, 'app-settings')),
      ttsHelperApiSettings: from(getFromStore<TtsHelperApiFeatureState>(this.settingsLocation, 'tts-helper-api-settings')),
      watchStreak: from(getFromStore<WatchStreakFeatureState>(this.settingsLocation, 'watch-streak')),
      youtube: from(getFromStore<YoutubeFeatureState>(this.settingsLocation, 'youtube')),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((
        {
          config,
          openai,
          twitch,
          azure,
          elevenLabs,
          vtubeStudio,
          vstream,
          appSettings,
          ttsHelperApiSettings,
          watchStreak,
          virtualMotionCapture,
          youtube,
        },
      ) => {
        this.handleGlobalData(config);
        this.handleOpenAIData(openai);
        this.handleTwitchData(twitch);
        this.handleAzureData(azure);
        this.handleElevenLabsData(elevenLabs);
        this.handleVTubeStudioData(vtubeStudio);
        this.handleVStreamData(vstream);
        this.handleAppData(appSettings);
        this.handleWatchStreakData(watchStreak);
        this.handleYoutubeData(youtube);
        this.handleVirtualMotionCapture(virtualMotionCapture);
        this.handleTtsHelperApiData(ttsHelperApiSettings);
      });

    /**
     * Handle saving the whole state to memory
     * Debounce to ignore multi updates so it can save "less" times than needed
     */

    this.configService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((state) => saveToStore(this.settingsLocation, 'config', state));

    this.twitchService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((state) => saveToStore(this.settingsLocation, 'twitch', state));

    this.azureService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => saveToStore(this.settingsLocation, 'azure', state));

    this.elevenLabsService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => saveToStore(this.settingsLocation, 'eleven-labs', state));

    this.vtubeStudioService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => saveToStore(this.settingsLocation, 'vtube-studio', state));

    this.openAIService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => saveToStore(this.settingsLocation, 'openai', state));

    this.vstreamService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => saveToStore(this.settingsLocation, 'vstream', state));

    this.appSettingsService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => saveToStore(this.settingsLocation, 'app-settings', state));

    this.chatService.watchStreakState$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => saveToStore(this.settingsLocation, 'watch-streak', state));

    effect(() => {
      const state: YoutubeFeatureState = {
        channelId: this.youtubeService.youtubeStore.channelId(),
        superChat: this.youtubeService.youtubeStore.superChat(),
      };

      saveToStore(this.settingsLocation, 'youtube', state);
    });

    effect(() => {
      const state = this.virtualMotionCaptureService.store.wholeState();

      saveToStore(this.settingsLocation, 'virtual-motion-capture', state);
    });

    effect(() => {
      const state = this.apiService.store.wholeState();

      saveToStore(this.settingsLocation, 'tts-helper-api-settings', state);
    });
  }

  handleAppData(data: { value: AppSettingsFeatureState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      AppSettingsActions.updateState({ partialState: data.value }),
    );
  }

  handleGlobalData(data: { value: ConfigState } | undefined) {
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

  handleOpenAIData(data: { value: OpenAIState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      OpenAIActions.updateState({ openAIState: data.value }),
    );
  }

  handleTwitchData(data: { value: TwitchState } | undefined) {
    if (!data || !data.value) {
      return this.twitchService.clearState();
    }

    this.store.dispatch(
      TwitchStateActions.updateState({ twitchState: data.value }),
    );
  }

  handleAzureData(data: { value: AzureState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      AzureActions.updateAzureState({ partialState: data.value }),
    );
  }

  handleElevenLabsData(data: { value: ElevenLabsState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      ElevenLabsActions.updateState({ partialState: data.value }),
    );
  }

  handleVTubeStudioData(data: { value: VTubeStudioState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      VTubeStudioActions.updateState({ partialState: data.value }),
    );
  }

  handleWatchStreakData(data: { value: WatchStreakFeatureState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      WatchStreakActions.updateState({ partialState: data.value }),
    );
  }

  handleYoutubeData(data: { value: YoutubeFeatureState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.youtubeService.updateState(data.value);
  }

  handleVirtualMotionCapture(data: { value: VirtualMotionCaptureState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.virtualMotionCaptureService.updateState(data.value);
  }

  handleTtsHelperApiData(data: { value: TtsHelperApiFeatureState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.apiService.updateState(data.value);
  }

  handleVStreamData(data: { value: VStreamState } | undefined) {
    if (!data || !data.value) {
      return;
    }

    this.store.dispatch(
      VStreamActions.updateState({ partialState: data.value }),
    );

    /**
     * Whenever the app loads, users sometimes want to reset certain counters.
     */
    this.vstreamService.commands$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        first(),
        map(commands => commands.filter((c): c is CounterCommand => c.type === 'counter' && c.resetOnLaunch)),
      )
      .subscribe(commands => {
        for (const command of commands) {
          this.vstreamService.updateCommandSettings({ value: 0, type: 'counter' }, command.id);
        }
      });
  }
}
