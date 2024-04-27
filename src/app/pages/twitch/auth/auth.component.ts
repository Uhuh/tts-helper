import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';

export type ConnectionType = 'Connected' | 'Disconnected' | 'Expired';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [NgClass, NgIf, LabelBlockComponent, AsyncPipe],
})
export class AuthComponent {
  private readonly twitchService = inject(TwitchService);

  // Rust server running so we can auth in the users browser
  private readonly redirect = 'http://localhost:12583/auth/twitch';
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';
  private readonly scopes =
    'channel%3Aread%3Aredemptions+channel%3Aread%3Asubscriptions+chat%3Aread+channel%3Amanage%3Aredemptions+bits%3Aread+moderator%3Aread%3Afollowers';
  readonly loginUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${this.redirect}&response_type=token&scope=${this.scopes}`;

  connectionStatus = signal<ConnectionType>('Disconnected');
  connectionMessage = signal('');
  isTokenValid = toSignal(this.twitchService.isTokenValid$);

  constructor() {
    combineLatest([
      this.twitchService.isTokenValid$,
      this.twitchService.token$,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([isTokenValid, token]) => {
        if (!token) {
          this.connectionStatus.set('Disconnected');
          this.connectionMessage.set(
            `You've been disconnected. You'll need to sign-in again to reconnect your Twitch account.`,
          );
        } else if (token && isTokenValid) {
          this.connectionStatus.set('Connected');
          this.connectionMessage.set(
            `Your Twitch account is currently connected with TTS Helper.`,
          );
        } else {
          this.connectionStatus.set('Expired');
          this.connectionMessage.set(
            `You haven't used the app for a long time, to keep your account secure we time out our sessions after two weeks of no activity.`,
          );
        }
      });
  }

  signOut() {
    this.twitchService.signOut();
  }
}
