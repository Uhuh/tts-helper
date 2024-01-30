import { TestBed } from '@angular/core/testing';
import { PlaybackService } from './playback.service';
import { MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { AudioFeature } from '../state/audio/audio.feature';

describe('PlaybackService', () => {
  let service: PlaybackService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(AudioFeature),
      ],
      providers: [
        PlaybackService,
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(PlaybackService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
