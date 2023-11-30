import { Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { getVersion } from '@tauri-apps/api/app';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { TwitchService } from '../../services/twitch.service';
import { VTubeStudioService } from '../../services/vtubestudio.service';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { from, interval, switchMap } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, NgOptimizedImage, NgClass, AsyncPipe],
})
export class SidenavComponent {
  @Input({ required: true }) nav!: MatSidenav;
  @Input() isMobile = false;
  appVersion = '';

  isTwitchTokenValid$ = this.twitchService.isTokenValid$;
  isVTSConnected$ = this.vtsService.isConnected$;
  newVersion = false;

  private readonly updateChecker = interval(5000)
    .pipe(switchMap(() => from(checkUpdate())))
    .subscribe((updater) => {
      if (!updater.shouldUpdate) {
        return;
      }

      this.newVersion = true;
    });

  constructor(private readonly twitchService: TwitchService, private readonly vtsService: VTubeStudioService) {
    getVersion().then((v) => (this.appVersion = v));
  }

  close() {
    if (!this.isMobile) return;

    this.nav.close();
  }

  async update() {
    await installUpdate();
  }
}
