import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { ConfigFeature } from '../state/config/config.feature';
import { PlaybackService } from './playback.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let store: MockStore;

  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;

  beforeEach(() => {
    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['']);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(ConfigFeature),
      ],
      providers: [
        ConfigService,
        { provide: PlaybackService, useValue: playbackServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(ConfigService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
