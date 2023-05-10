import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf, NgClass } from '@angular/common';

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
  ],
})
export class NavComponent implements OnInit {
  isMobile = false;

  constructor(private readonly breakpoint: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpoint.observe(['(max-width: 900px)']).subscribe((state) => {
      this.isMobile = state.matches;
    });
  }
}
