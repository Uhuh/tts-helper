import { Component, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { getVersion } from '@tauri-apps/api/app';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
})
export class SidenavComponent {
  @Input() nav!: MatSidenav;
  @Input() isMobile = false;
  appVersion: string = '';

  constructor() {
    getVersion().then((v) => (this.appVersion = v));
  }

  close() {
    if (!this.isMobile) return;

    this.nav.close();
  }
}
