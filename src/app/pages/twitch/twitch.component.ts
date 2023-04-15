import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TwitchService } from "../../shared/services/twitch.service";
import { listen } from "@tauri-apps/api/event";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TwitchComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  // Rust server running so we can auth in the users browser
  private readonly redirect = 'http://localhost:12583/auth/twitch';
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';
  private readonly scopes =
    'channel%3Aread%3Aredemptions+channel%3Aread%3Asubscriptions+chat%3Aread';
  readonly loginUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${this.redirect}&response_type=token&scope=${this.scopes}`;

  isTokenValid = false;
  constructor(
    private readonly twitchService: TwitchService,
    private readonly snackbar: MatSnackBar,
    private readonly ref: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.twitchService.isTokenValid$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isTokenValid => {
        this.isTokenValid = isTokenValid;
        this.ref.detectChanges();
      });
    
    listen('access-token', (authData) => {
      const { token, provider } = authData.payload as { token: string, provider: 'twitch' | 'youtube' };

      if (provider !== 'twitch') {
        return;
      }

      this.twitchService.updateToken(token);
    })
      .catch(e => {
        console.error('Encountered issue getting access token.', e);

        this.snackbar.open(
          'Oops! We encountered an error while authorizing...',
          'Dismiss',
          {
            panelClass: 'notification-error',
          }
        );
      });
  }

  signOut() {
    this.twitchService.signOut();
    this.ref.detectChanges();
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
