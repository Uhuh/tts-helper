import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { PlaybackService } from '../../services/playback.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
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
    ]
})
export class NavComponent implements OnInit {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly playbackService = inject(PlaybackService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isPaused$ = this.playbackService.isPaused$;
  isMobile = false;

  ngOnInit(): void {
    this.breakpoint.observe(['(max-width: 900px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isMobile = state.matches;
      });
  }

  unpause() {
    this.playbackService.togglePause();
  }
}
