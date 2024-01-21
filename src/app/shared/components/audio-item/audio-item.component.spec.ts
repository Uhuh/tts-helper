import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioItemComponent } from './audio-item.component';
import { AudioService } from '../../services/audio.service';
import { PlaybackService } from '../../services/playback.service';
import { LogService } from '../../services/logs.service';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AudioItem, AudioStatus } from '../../state/audio/audio.feature';

describe('AudioItemComponent', () => {
  let component: AudioItemComponent;
  let fixture: ComponentFixture<AudioItemComponent>;

  const audioItem: AudioItem = {
    source: 'vstream',
    text: 'Hello world!',
    state: AudioStatus.playing,
    username: 'Panku',
    id: 1,
    createdAt: new Date(),
  };

  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  beforeEach(async () => {
    audioServiceStub = jasmine.createSpyObj('AudioService', ['']);
    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['']);
    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.overrideComponent(AudioItemComponent, {
      set: {
        imports: [DatePipe],
        providers: [
          { provide: AudioService, useValue: audioServiceStub },
          { provide: PlaybackService, useValue: playbackServiceStub },
          { provide: LogService, useValue: logServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(AudioItemComponent);
    component = fixture.componentInstance;

    component.audio = audioItem;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
