import { TestBed } from '@angular/core/testing';
import { StreamDeckWebSocketService } from './streamdeck-websocket.service';
import { AzureSttService } from './azure-stt.service';
import { PlaybackService } from './playback.service';
import { LogService } from './logs.service';
import { AudioService } from './audio.service';
import { BehaviorSubject } from 'rxjs';

describe('StreamDeckWebSocketService', () => {
  let service: StreamDeckWebSocketService;

  let azuresttServiceStub: jasmine.SpyObj<AzureSttService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;
  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  beforeEach(() => {
    azuresttServiceStub = jasmine.createSpyObj('AzureSTTService', ['captureSpeech']);
    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['togglePause', 'skipCurrentlyPlaying', 'setAudioState'], {
      isPaused$: new BehaviorSubject(false),
    });
    audioServiceStub = jasmine.createSpyObj('AudioService', ['removeAudio', 'playTts'], {
      audioItems$: new BehaviorSubject([]),
    });
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        StreamDeckWebSocketService,
        { provide: AzureSttService, useValue: azuresttServiceStub },
        { provide: PlaybackService, useValue: playbackServiceStub },
        { provide: AudioService, useValue: audioServiceStub },
        { provide: LogService, useValue: logServiceStub },
      ],
    });

    service = TestBed.inject(StreamDeckWebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
