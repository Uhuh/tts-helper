import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { PlaybackService } from '../../services/playback.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    SidenavComponent,
    NgClass,
    ButtonComponent,
    AsyncPipe,
  ],
})
export class NavComponent implements OnInit {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly playbackService = inject(PlaybackService);
  readonly isPaused$ = this.playbackService.isPaused$;
  isMobile = false;

  ngOnInit(): void {
    this.breakpoint.observe(['(max-width: 900px)']).subscribe((state) => {
      this.isMobile = state.matches;
    });
  }

  unpause() {
    this.playbackService.togglePause();
  }
}
