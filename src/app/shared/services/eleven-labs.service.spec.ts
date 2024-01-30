import { TestBed } from '@angular/core/testing';
import { ElevenLabsService } from './eleven-labs.service';
import { MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { ElevenLabsFeature } from '../state/eleven-labs/eleven-labs.feature';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ElevenLabsService', () => {
  let service: ElevenLabsService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(ElevenLabsFeature),
      ],
      providers: [
        ElevenLabsService,
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(ElevenLabsService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
