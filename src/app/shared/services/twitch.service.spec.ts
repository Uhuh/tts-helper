import { TestBed } from '@angular/core/testing';
import { TwitchService } from './twitch.service';
import { StoreModule } from '@ngrx/store';
import { TwitchFeature } from '../state/twitch/twitch.feature';
import { MockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LogService } from './logs.service';

describe('TwitchService', () => {
  let service: TwitchService;
  let store: MockStore;

  let logServiceStub: jasmine.SpyObj<LogService>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(TwitchFeature),
      ],
      providers: [
        TwitchService,
        { provide: LogService, useValue: logServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(TwitchService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
