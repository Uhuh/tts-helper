import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { PlaybackService } from '../../services/playback.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;

  beforeEach(() => {
    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['']);

    TestBed.overrideComponent(NavComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: PlaybackService, useValue: playbackServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
