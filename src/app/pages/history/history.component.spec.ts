import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryComponent } from './history.component';
import { LogService } from '../../shared/services/logs.service';
import { PlaybackService } from '../../shared/services/playback.service';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  let logServiceStub: jasmine.SpyObj<LogService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;

  let isPausedSubject: Subject<boolean>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    isPausedSubject = new Subject();

    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['togglePause'], {
      isPaused$: isPausedSubject,
    });

    playbackServiceStub.togglePause.and.returnValue(Promise.resolve());

    TestBed.overrideComponent(HistoryComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: LogService, useValue: logServiceStub },
          { provide: PlaybackService, useValue: playbackServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle audio pause', () => {
    // Act
    component.togglePause();

    // Assert
    expect(playbackServiceStub.togglePause).toHaveBeenCalled();
  });
});
