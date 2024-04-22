import { TestBed } from '@angular/core/testing';
import { VTubeStudioService } from './vtubestudio.service';
import { MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { VTubeStudioFeature } from '../state/vtubestudio/vtubestudio.feature.';
import { LogService } from './logs.service';
import { PlaybackService } from './playback.service';
import { ConfigService } from './config.service';
import { Subject } from 'rxjs';
import { AuthTokens } from '../state/config/config.feature';

xdescribe('VTubeStudioService', () => {
  let service: VTubeStudioService;
  let store: MockStore;

  let logServiceStub: jasmine.SpyObj<LogService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;
  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let authTokensSubject: Subject<AuthTokens>;

  let audioStartedSubject: Subject<number>;
  let audioFinishedSubject: Subject<number>;
  let audioSkippedSubject: Subject<number>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    audioStartedSubject = new Subject();
    audioFinishedSubject = new Subject();
    audioSkippedSubject = new Subject();

    playbackServiceStub = jasmine.createSpyObj('PlaybackService', [''], {
      audioStarted$: audioStartedSubject,
      audioFinished$: audioFinishedSubject,
      audioSkipped$: audioSkippedSubject,
    });

    authTokensSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      authTokens$: authTokensSubject,
    });

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(VTubeStudioFeature),
      ],
      providers: [
        VTubeStudioService,
        { provide: LogService, useValue: logServiceStub },
        { provide: PlaybackService, useValue: playbackServiceStub },
        { provide: ConfigService, useValue: configServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(VTubeStudioService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
