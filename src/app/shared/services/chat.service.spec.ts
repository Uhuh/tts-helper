import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { ConfigService } from './config.service';
import { OpenAIService } from './openai.service';
import { AudioService } from './audio.service';
import { Subject } from 'rxjs';
import { GeneralChatState } from '../state/config/config.feature';
import { GptChatState } from '../state/openai/openai.feature';

describe('ChatService', () => {
  let service: ChatService;

  let configServiceStub: jasmine.SpyObj<ConfigService>;
  let openaiServiceStub: jasmine.SpyObj<OpenAIService>;
  let audioServiceStub: jasmine.SpyObj<AudioService>;

  let generalChatSubject: Subject<GeneralChatState>;
  let openaiChatSubject: Subject<GptChatState>;

  beforeEach(() => {
    generalChatSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      generalChat$: generalChatSubject,
    });

    openaiChatSubject = new Subject();

    openaiServiceStub = jasmine.createSpyObj('OpenAIService', [''], {
      chatSettings$: openaiChatSubject,
    });
    
    audioServiceStub = jasmine.createSpyObj('AudioService', ['']);

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: ConfigService, useValue: configServiceStub },
        { provide: OpenAIService, useValue: openaiServiceStub },
        { provide: AudioService, useValue: audioServiceStub },
      ],
    });

    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
