import { Component, computed, DestroyRef, inject, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { getVersion } from '@tauri-apps/api/app';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { MatDialog } from '@angular/material/dialog';
import { ChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppSettingsService } from '../../services/app-settings.service';
import { MatTooltip } from '@angular/material/tooltip';
import { ConnectionsService } from '../../services/connections.service';
import { ObsWebSocketService } from '../../services/obs-websocket.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  imports: [RouterLink, RouterLinkActive, MatIconModule, NgOptimizedImage, MatTooltip],
})
export class SidenavComponent {
  readonly #matDialog = inject(MatDialog);
  readonly #destroyRef = inject(DestroyRef);
  readonly #router = inject(Router);
  readonly #appSettingsService = inject(AppSettingsService);
  readonly #connectionsService = inject(ConnectionsService);
  readonly #obsWebSocketService = inject(ObsWebSocketService);

  readonly pngTtsConnected = this.#obsWebSocketService.pngTtsConnected;

  readonly connections = computed(() => {
    const connections = this.#connectionsService.connections();

    return connections.filter(c => c.enabled);
  });
  readonly connectionsExpanded = this.#connectionsService.connectionsExpanded;

  toggleConnections(): void {
    this.#appSettingsService.toggleConnectionsExpanded();
  }

  @Input({ required: true }) nav!: MatSidenav;
  @Input() isMobile = false;
  appVersion = '';

  newVersion = false;
  updater?: Update;

  constructor() {
    getVersion().then((v) => (this.appVersion = v));

    this.#router.events.subscribe(event => {
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

  close() {
    if (!this.isMobile) {
      return;
    }

    this.nav.close();
  }

  openUpdateDialog() {
    const dialogRef = this.#matDialog.open(ChangelogDialogComponent, {
      width: '500px',
      data: {
        version: this.updater?.version,
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(async update => {
        if (!update) {
          return;
        }

        await this.updater?.downloadAndInstall();

        await relaunch();
      });
  }
}
