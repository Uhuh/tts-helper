import { Component, DestroyRef, inject, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { getVersion } from '@tauri-apps/api/app';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { TwitchService } from '../../services/twitch.service';
import { VTubeStudioService } from '../../services/vtubestudio.service';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { VStreamService } from '../../services/vstream.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppSettingsService } from '../../services/app-settings.service';
import { AppSettingsFeatureState } from '../../state/app-settings/app-settings.feature';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [RouterLink, RouterLinkActive, MatIconModule, NgOptimizedImage, AsyncPipe],
})
export class SidenavComponent {
  private readonly twitchService = inject(TwitchService);
  private readonly vtsService = inject(VTubeStudioService);
  private readonly vstreamService = inject(VStreamService);
  private readonly matDialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly appSettingsService = inject(AppSettingsService);

  @Input({ required: true }) nav!: MatSidenav;
  @Input() isMobile = false;
  appVersion = '';

  readonly connections$ = this.appSettingsService.connections$;
  readonly isTwitchTokenValid$ = this.twitchService.isTokenValid$;
  readonly isVTSConnected$ = this.vtsService.isConnected$;
  readonly isVStreamConnected$ = this.vstreamService.isTokenValid$;
  newVersion = false;
  updater?: Update;

  constructor() {
    getVersion().then((v) => (this.appVersion = v));

    this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      this.close();
    });

    this.checkForUpdate();
  }

  async checkForUpdate() {
    const update = await check();

    if (!update?.available) {
      return;
    }

    this.updater = update;

    this.newVersion = true;

    this.openUpdateDialog();
  }

  unavailableConnections(connections: AppSettingsFeatureState['connections']) {
    return !connections.vtubestudioEnabled && !connections.vstreamEnabled && !connections.twitchEnabled;
  }

  close() {
    if (!this.isMobile) {
      return;
    }

    this.nav.close();
  }

  openUpdateDialog() {
    const dialogRef = this.matDialog.open(ChangelogDialogComponent, {
      width: '500px',
      data: {
        version: this.updater?.version,
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async update => {
        if (!update) {
          return;
        }

        await this.updater?.downloadAndInstall();

        await relaunch();
      });
  }
}
