import { TestBed } from '@angular/core/testing';
import { VStreamPubSubService } from './vstream-pubsub.service';
import { VStreamService } from './vstream.service';
import { CommandService } from './command.service';
import { OpenAIService } from './openai.service';
import { ChatService } from './chat.service';
import { AudioService } from './audio.service';
import { LogService } from './logs.service';
import { Subject } from 'rxjs';
import { GptSettingsState } from '../state/openai/openai.feature';
import {
  VStreamChannelState,
  VStreamCustomMessageState,
  VStreamSettingsState,
  VStreamSubscriptionSettingsState,
  VStreamToken,
  VStreamWidget,
} from '../state/vstream/vstream.feature';

describe('VStreamPubSubService', () => {
  let service: VStreamPubSubService;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;
  let commandServiceStub: jasmine.SpyObj<CommandService>;
  let openaiServiceStub: jasmine.SpyObj<OpenAIService>;
  let chatServiceStub: jasmine.SpyObj<ChatService>;
  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  let openaiSettingsSubject: Subject<GptSettingsState>;

  let vstreamSettingsSubject: Subject<VStreamSettingsState>;
  let vstreamWidgetsSubject: Subject<VStreamWidget[]>;

  let vstreamTokenSubject: Subject<VStreamToken>;
  let vstreamChannelInfoSubject: Subject<VStreamChannelState>;

  let vstreamMeteorShowerSubject: Subject<VStreamCustomMessageState>;
  let vstreamSubscriptionSubject: Subject<VStreamSubscriptionSettingsState>;
  let vstreamUpliftSubject: Subject<VStreamCustomMessageState>;
  let vstreamFollowerSubject: Subject<VStreamCustomMessageState>;

  beforeEach(() => {
    vstreamSettingsSubject = new Subject();
    vstreamWidgetsSubject = new Subject();
    vstreamMeteorShowerSubject = new Subject();
    vstreamSubscriptionSubject = new Subject();
    vstreamUpliftSubject = new Subject();
    vstreamFollowerSubject = new Subject();
    vstreamTokenSubject = new Subject();
    vstreamChannelInfoSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      settings$: vstreamSettingsSubject,
      widgets$: vstreamWidgetsSubject,
      meteorShowerSettings$: vstreamMeteorShowerSubject,
      subscriptionSettings$: vstreamSubscriptionSubject,
      upliftSettings$: vstreamUpliftSubject,
      followerSettings$: vstreamFollowerSubject,
      token$: vstreamTokenSubject,
      channelInfo$: vstreamChannelInfoSubject,
    });

    commandServiceStub = jasmine.createSpyObj('CommandService', ['']);

    openaiSettingsSubject = new Subject();

    openaiServiceStub = jasmine.createSpyObj('OpenAIService', [''], {
      settings$: openaiSettingsSubject,
    });

    chatServiceStub = jasmine.createSpyObj('ChatService', ['']);
    audioServiceStub = jasmine.createSpyObj('AudioService', ['']);
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        VStreamPubSubService,
        { provide: VStreamService, useValue: vstreamServiceStub },
        { provide: CommandService, useValue: commandServiceStub },
        { provide: OpenAIService, useValue: openaiServiceStub },
        { provide: ChatService, useValue: chatServiceStub },
        { provide: AudioService, useValue: audioServiceStub },
        { provide: LogService, useValue: logServiceStub },
      ],
    });

    service = TestBed.inject(VStreamPubSubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
