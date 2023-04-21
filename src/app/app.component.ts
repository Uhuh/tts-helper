import { Component } from '@angular/core';
import { TwitchPubSub } from './shared/services/twitch-pubsub';
import { StorageService } from './shared/services/storage.service';
import { TwitchState } from './shared/state/twitch/twitch.model';
import { updateTwitchState } from './shared/state/twitch/twitch.actions';
import { Store } from '@ngrx/store';
import { TwitchService } from './shared/services/twitch.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  /**
   * @TODO - Figure out a better way to have the service come alive that isn't
   * just injecting it into the root of the app.
   */
  constructor(
    private readonly store: Store,
    private readonly twitchPubSub: TwitchPubSub,
    private readonly twitchService: TwitchService,
    private readonly storageService: StorageService
  ) {
    this.storageService
      .getFromStore<TwitchState>('.settings.json', 'twitch')
      .subscribe((data) => {
        console.log('data from twitch.json', data?.value);
        if (!data || !data.value) {
          return this.twitchService.clearState();
        }

        this.store.dispatch(updateTwitchState({ twitchState: data.value }));
      });

    /**
     * Handle saving the whole twitch state to memory
     * Debounce to ignore multi updates so it can save "less" times than needed
     */
    this.twitchService.twitchState$
      .pipe(debounceTime(500))
      .subscribe((state) => {
        console.log('Updating storage twitch.json', state);
        this.storageService.saveToStore('.settings.json', 'twitch', state);
      });
  }
}
