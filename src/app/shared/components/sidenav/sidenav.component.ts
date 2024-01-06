import { Component, inject, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { getVersion } from '@tauri-apps/api/app';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { TwitchService } from '../../services/twitch.service';
import { VTubeStudioService } from '../../services/vtubestudio.service';
import { checkUpdate, installUpdate, UpdateResult } from '@tauri-apps/api/updater';
import { from, interval, switchMap } from 'rxjs';
import { VStreamService } from '../../services/vstream.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, NgOptimizedImage, NgClass, AsyncPipe],
})
export class SidenavComponent {
  private readonly twitchService = inject(TwitchService);
  private readonly vtsService = inject(VTubeStudioService);
  private readonly vstreamService = inject(VStreamService);
  private readonly matDialog = inject(MatDialog);

  @Input({ required: true }) nav!: MatSidenav;
  @Input() isMobile = false;
  appVersion = '';

  readonly isTwitchTokenValid$ = this.twitchService.isTokenValid$;
  readonly isVTSConnected$ = this.vtsService.isConnected$;
  readonly isVStreamConnected$ = this.vstreamService.isTokenValid$;
  newVersion = false;
  updateInfo?: UpdateResult;

  private readonly updateChecker$ = interval(5000)
    .pipe(switchMap(() => from(checkUpdate())))
    .subscribe((updater) => {
      if (!updater.shouldUpdate) {
        return;
      }

      this.updateInfo = updater;

      this.newVersion = true;
    });

  constructor() {
    getVersion().then((v) => (this.appVersion = v));
  }

  close() {
    if (!this.isMobile) {
      return;
    }

    this.nav.close();
  }

  update() {
    const dialogRef = this.matDialog.open(ChangelogDialogComponent, {
      width: '500px',
      data: {
        version: this.updateInfo?.manifest?.version,
      },
    });

    dialogRef.afterClosed()
      .subscribe(update => {
        // If the user clicked update in the dialog.
        if (update) {
          installUpdate();
        }
      });
  }
}
