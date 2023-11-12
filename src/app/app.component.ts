import { Component } from '@angular/core';
import { TwitchPubSub } from './shared/services/twitch-pubsub';
import { StorageService } from './shared/services/storage.service';
import { Store } from '@ngrx/store';
import { TwitchService } from './shared/services/twitch.service';
import { debounceTime } from 'rxjs';
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavComponent, RouterOutlet],
})
export class AppComponent {
  /**
   * @TODO - Figure out a better way to have the service come alive that isn't
   * just injecting it into the root of the app.
   */
  constructor(
    private readonly store: Store,
    private readonly azureService: AzureSttService,
    private readonly twitchPubSub: TwitchPubSub,
    private readonly configService: ConfigService,
    private readonly twitchService: TwitchService,
    private readonly storageService: StorageService,
    private readonly playbackService: PlaybackService,
    private readonly vtubeStudioService: VTubeStudioService,
  ) {
    this.storageService
      .getFromStore<TwitchState>('.settings.json', 'twitch')
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        if (!data || !data.value) {
          return this.twitchService.clearState();
        }

        this.store.dispatch(
          TwitchStateActions.updateState({ twitchState: data.value }),
        );
      });

    this.storageService
      .getFromStore<ConfigState>('.settings.json', 'config')
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        if (!data || !data.value) {
          return;
        }

        // Setup user audio device and volume on startup.
        this.playbackService.setOutputDevice(data.value.audioDevice);
        this.playbackService.setVolumeLevel(data.value.deviceVolume);

        this.store.dispatch(
          GlobalConfigActions.updateState({ configState: data.value }),
        );
      });

    this.storageService
      .getFromStore<AzureState>('.settings.json', 'azure')
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        if (!data || !data.value) {
          return;
        }

        this.store.dispatch(
          AzureActions.updateAzureState({ partialState: data.value }),
        );
      });

    /**
     * Handle saving the whole state to memory
     * Debounce to ignore multi updates so it can save "less" times than needed
     */

    this.configService.configState$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((state) => {
        this.storageService.saveToStore('.settings.json', 'config', state);
      });

    this.twitchService.twitchState$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe((state) => {
        this.storageService.saveToStore('.settings.json', 'twitch', state);
      });

    this.azureService.state$
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(state => {
        this.storageService.saveToStore('.settings.json', 'azure', state);
      });
  }
}
