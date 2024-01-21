import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryComponent } from './history.component';
import { LogService } from '../../shared/services/logs.service';
import { PlaybackService } from '../../shared/services/playback.service';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  let logServiceStub: jasmine.SpyObj<LogService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['']);
    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['']);

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
});
