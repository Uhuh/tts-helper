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
    private readonly twitchPubSub: TwitchPubSub,
    private readonly configService: ConfigService,
    private readonly twitchService: TwitchService,
    private readonly storageService: StorageService,
    private readonly playbackService: PlaybackService
  ) {
    this.storageService
      .getFromStore<TwitchState>('.settings.json', 'twitch')
      .subscribe((data) => {
        if (!data || !data.value) {
          return this.twitchService.clearState();
        }

        this.store.dispatch(
          TwitchStateActions.updateState({ twitchState: data.value })
        );
      });

    this.storageService
      .getFromStore<ConfigState>('.settings.json', 'config')
      .subscribe((data) => {
        if (!data || !data.value) {
          return;
        }

        this.store.dispatch(
          GlobalConfigActions.updateState({ configState: data.value })
        );
      });

    /**
     * Handle saving the whole state to memory
     * Debounce to ignore multi updates so it can save "less" times than needed
     */

    this.configService.configState$
      .pipe(debounceTime(500))
      .subscribe((state) => {
        this.storageService.saveToStore('.settings.json', 'config', state);
      });

    this.twitchService.twitchState$
      .pipe(debounceTime(500))
      .subscribe((state) => {
        this.storageService.saveToStore('.settings.json', 'twitch', state);
      });
  }
}
