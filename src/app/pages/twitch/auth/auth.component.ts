import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { TwitchService } from 'src/app/shared/services/twitch.service';

export type ConnectionType = 'Connected' | 'Disconnected' | 'Expired';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  // Rust server running so we can auth in the users browser
  private readonly redirect = 'http://localhost:12583/auth/twitch';
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';
  private readonly scopes =
    'channel%3Aread%3Aredemptions+channel%3Aread%3Asubscriptions+chat%3Aread+channel%3Amanage%3Aredemptions';
  readonly loginUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${this.redirect}&response_type=token&scope=${this.scopes}`;

  connectionStatus: ConnectionType = 'Disconnected';
  connectionMessage = '';
  isTokenValid = false;

  constructor(
    private readonly twitchService: TwitchService,
    private readonly ref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.twitchService.isTokenValid$,
      this.twitchService.twitchToken$,
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([isTokenValid, token]) => {
        this.isTokenValid = isTokenValid;
        if (!token) {
          this.connectionStatus = 'Disconnected';
          this.connectionMessage = `You've been disconnected. You'll need to sign-in again to reconnect your Twitch account.`;
        } else if (token && this.isTokenValid) {
          this.connectionStatus = 'Connected';
          this.connectionMessage = `Your Twitch account is currently connected with TTS Helper.`;
        } else {
          this.connectionStatus = 'Expired';
          this.connectionMessage = `You haven't used the app for a long time, to keep your account secure we time out our sessions after two weeks of no activity.`;
        }

        this.ref.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  signOut() {
    this.twitchService.signOut();
    this.ref.detectChanges();
  }
}
