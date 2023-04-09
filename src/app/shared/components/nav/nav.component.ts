import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly destroyed = new Subject<void>();
  isMobile = false;

  constructor(private readonly breakpoint: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpoint.observe(['(max-width: 900px)']).subscribe((state) => {
      this.isMobile = state.matches;
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
