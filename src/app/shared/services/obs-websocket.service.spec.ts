import { TestBed } from '@angular/core/testing';
import { ObsWebSocketService } from './obs-websocket.service';
import { PlaybackService } from './playback.service';
import { AudioService } from './audio.service';
import { LogService } from './logs.service';
import { Subject } from 'rxjs';
import { AudioItem } from '../state/audio/audio.feature';

describe('ObsWebSocketService', () => {
  let service: ObsWebSocketService;

  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;
  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  let audioItemsSubject: Subject<AudioItem[]>;
  let audioStartedSubject: Subject<number>;
  let audioFinishedSubject: Subject<number>;
  let audioSkippedSubject: Subject<number>;

  beforeEach(() => {
    audioStartedSubject = new Subject();
    audioFinishedSubject = new Subject();
    audioSkippedSubject = new Subject();

    playbackServiceStub = jasmine.createSpyObj('PlaybackService', [''], {
      audioStarted$: audioStartedSubject,
      audioFinished$: audioFinishedSubject,
      audioSkipped$: audioSkippedSubject,
    });

    audioItemsSubject = new Subject();

    audioServiceStub = jasmine.createSpyObj('AudioService', [''], {
      audioItems$: audioItemsSubject,
    });
    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.configureTestingModule({
      providers: [
        ObsWebSocketService,
        { provide: PlaybackService, useValue: playbackServiceStub },
        { provide: AudioService, useValue: audioServiceStub },
        { provide: LogService, useValue: logServiceStub },
      ],
    });

    service = TestBed.inject(ObsWebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
