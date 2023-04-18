import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { TwitchService } from '../../shared/services/twitch.service';
import { listen } from '@tauri-apps/api/event';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss'],
})
export class TwitchComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly twitchService: TwitchService,
    private readonly snackbar: MatSnackBar,
    private readonly ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    listen('access-token', (authData) => {
      const { token, provider } = authData.payload as {
        token: string;
        provider: 'twitch' | 'youtube';
      };

      if (provider !== 'twitch') {
        return;
      }

      this.twitchService.updateToken(token);
    }).catch((e) => {
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
