import { TestBed } from '@angular/core/testing';
import { OpenAIService } from './openai.service';
import { MockStore } from '@ngrx/store/testing';
import { OpenAIFeature } from '../state/openai/openai.feature';
import { AudioService } from './audio.service';
import { LogService } from './logs.service';
import { StoreModule } from '@ngrx/store';

describe('OpenAIService', () => {
  let service: OpenAIService;
  let store: MockStore;

  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  beforeEach(() => {
    audioServiceStub = jasmine.createSpyObj('AudioService', ['']);
    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(OpenAIFeature),
      ],
      providers: [
        OpenAIService,
        { provide: AudioService, useValue: audioServiceStub },
        { provide: LogService, useValue: logServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    store = TestBed.inject(MockStore);

    service = TestBed.inject(OpenAIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
