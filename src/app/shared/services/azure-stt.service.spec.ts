import { TestBed } from '@angular/core/testing';
import { AzureSttService } from './azure-stt.service';
import { StoreModule } from '@ngrx/store';
import { AzureFeature } from '../state/azure/azure.feature';
import { MockStore } from '@ngrx/store/testing';
import { OpenAIService } from './openai.service';
import { LogService } from './logs.service';
import { TwitchService } from './twitch.service';
import { Subject } from 'rxjs';
import { TwitchChannelInfo } from '../state/twitch/twitch.feature';
import { SpeechConfig } from 'microsoft-cognitiveservices-speech-sdk';

describe('AzureSttService', () => {
  let service: AzureSttService;
  let store: MockStore;

  let openaiServiceStub: jasmine.SpyObj<OpenAIService>;
  let logServiceStub: jasmine.SpyObj<LogService>;
  let twitchServiceStub: jasmine.SpyObj<TwitchService>;

  let channelInfoSubject: Subject<TwitchChannelInfo>;

  beforeEach(() => {
    openaiServiceStub = jasmine.createSpyObj('OpenAIService', ['']);
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    channelInfoSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      channelInfo$: channelInfoSubject,
    });

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(AzureFeature),
      ],
      providers: [
        AzureSttService,
        { provide: OpenAIService, useValue: openaiServiceStub },
        { provide: LogService, useValue: logServiceStub },
        { provide: TwitchService, useValue: twitchServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(AzureSttService);
    store = TestBed.inject(MockStore);

    service.isEnabled = true;
    service.isCurrentlyListening = false;
    service.speechConfig = {} as SpeechConfig;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
