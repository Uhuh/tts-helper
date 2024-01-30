import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveQueueComponent } from './live-queue.component';
import { LogService } from '../../shared/services/logs.service';
import { PlaybackService } from '../../shared/services/playback.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';

describe('LiveQueueComponent', () => {
  let component: LiveQueueComponent;
  let fixture: ComponentFixture<LiveQueueComponent>;

  let logServiceStub: jasmine.SpyObj<LogService>;
  let platbackServiceStub: jasmine.SpyObj<PlaybackService>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['']);
    platbackServiceStub = jasmine.createSpyObj('PlaybackService', ['']);

    TestBed.overrideComponent(LiveQueueComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: LogService, useValue: logServiceStub },
          { provide: PlaybackService, useValue: platbackServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(LiveQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle pause for audio queue', () => {
    // Act
    component.togglePause();

    // Arrange
    expect(platbackServiceStub.togglePause).toHaveBeenCalled();
  });
});
