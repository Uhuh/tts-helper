import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';
import { MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { AudioFeature } from '../state/audio/audio.feature';
import { ConfigService } from './config.service';
import { PlaybackService } from './playback.service';
import { ElevenLabsService } from './eleven-labs.service';
import { TwitchService } from './twitch.service';
import { LogService } from './logs.service';
import { Subject } from 'rxjs';
import {
  AmazonPollyData,
  StreamElementsData,
  TikTokData,
  TtsMonsterData,
  TtsType,
} from '../state/config/config.feature';
import { ElevenLabsState } from '../state/eleven-labs/eleven-labs.feature';
import { TwitchState } from '../state/twitch/twitch.feature';


describe('AudioService', () => {
  let service: AudioService;
  let store: MockStore;

  let configServiceStub: jasmine.SpyObj<ConfigService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;
  let elevenlabServiceStub: jasmine.SpyObj<ElevenLabsService>;
  let twitchServiceStub: jasmine.SpyObj<TwitchService>;
  let logsServiceStub: jasmine.SpyObj<LogService>;

  let configAudioSettingsSubject: Subject<{
    bannedWords: string[];
    tts: TtsType;
    streamElements: StreamElementsData;
    ttsMonster: TtsMonsterData;
    amazonPolly: AmazonPollyData;
    tikTok: TikTokData;
    elevenLabs: ElevenLabsState;
  }>;

  let twitchSettingsSubject: Subject<TwitchState>;
  let elevenlabsStateSubject: Subject<ElevenLabsState>;
  let audioStartedSubject: Subject<number>;
  let audioFinishedSubject: Subject<number>;

  beforeEach(() => {
    configAudioSettingsSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      audioSettings$: configAudioSettingsSubject,
    });

    audioStartedSubject = new Subject();
    audioFinishedSubject = new Subject();

    playbackServiceStub = jasmine.createSpyObj('PlaybackService', [''], {
      audioStarted$: audioStartedSubject,
      audioFinished$: audioFinishedSubject,
    });

    elevenlabsStateSubject = new Subject();

    elevenlabServiceStub = jasmine.createSpyObj('ElevenLabsService', [''], {
      state$: elevenlabsStateSubject,
    });

    twitchSettingsSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      settings$: twitchSettingsSubject,
    });

    logsServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(AudioFeature),
      ],
      providers: [
        AudioService,
        { provide: ConfigService, useValue: configServiceStub },
        { provide: PlaybackService, useValue: playbackServiceStub },
        { provide: ElevenLabsService, useValue: elevenlabServiceStub },
        { provide: TwitchService, useValue: twitchServiceStub },
        { provide: LogService, useValue: logsServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(AudioService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
