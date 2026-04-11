import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioItemComponent } from './audio-item.component';
import { AudioService } from '../../services/audio.service';
import { PlaybackService } from '../../services/playback.service';
import { LogService } from '../../services/logs.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AudioItem, AudioStatus } from '../../state/audio/audio.feature';
import { BehaviorSubject } from 'rxjs';

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
  let isPaused$: BehaviorSubject<boolean>;

  beforeEach(async () => {
    audioServiceStub = jasmine.createSpyObj('AudioService', ['removeAudio', 'requeue', 'playTts']);
    isPaused$ = new BehaviorSubject<boolean>(false);
    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['setAudioState'], {
      isPaused$,
    });
    playbackServiceStub.setAudioState.and.returnValue(Promise.resolve());
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    TestBed.overrideComponent(AudioItemComponent, {
      set: {
        imports: [DatePipe, AsyncPipe],
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

  it('should manually play queued audio while paused', () => {
    // Arrange
    component.audio = {
      ...audioItem,
      state: AudioStatus.queued,
    };
    isPaused$.next(true);

    // Act
    component.manualPlay();

    // Assert
    expect(audioServiceStub.removeAudio).toHaveBeenCalledOnceWith(audioItem.id);
    expect(playbackServiceStub.setAudioState).toHaveBeenCalledOnceWith({ id: audioItem.id, skipped: true });
    expect(audioServiceStub.playTts).toHaveBeenCalledOnceWith(
      audioItem.text,
      audioItem.username,
      audioItem.source,
      1000,
      true,
      true,
    );
  });
});
