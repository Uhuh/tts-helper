import { TestBed } from '@angular/core/testing';
import { TwitchPubSub } from './twitch-pubsub';
import { TwitchService } from './twitch.service';
import { AudioService } from './audio.service';
import { LogService } from './logs.service';
import { OpenAIService } from './openai.service';
import { ChatService } from './chat.service';
import { Subject } from 'rxjs';
import {
  TwitchBitState,
  TwitchChannelInfo,
  TwitchRedeemState,
  TwitchState,
  TwitchSubscriptionState,
} from '../state/twitch/twitch.feature';
import { OpenAIState } from '../state/openai/openai.feature';

describe('TwitchPubSub', () => {
  let service: TwitchPubSub;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;
  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let logServiceStub: jasmine.SpyObj<LogService>;
  let openaiServiceStub: jasmine.SpyObj<OpenAIService>;
  let chatServiceStub: jasmine.SpyObj<ChatService>;

  let bitInfoSubject: Subject<TwitchBitState>;
  let redeemInfoSubject: Subject<TwitchRedeemState>;
  let subscriptionsSubject: Subject<TwitchSubscriptionState>;
  let twitchSettingsSubject: Subject<TwitchState>;

  let twitchTokenSubject: Subject<string>;
  let twitchChannelInfoSubject: Subject<TwitchChannelInfo>;

  let openaiSettingsSubject: Subject<OpenAIState>;

  beforeEach(() => {
    bitInfoSubject = new Subject();
    redeemInfoSubject = new Subject();
    subscriptionsSubject = new Subject();
    twitchSettingsSubject = new Subject();
    twitchTokenSubject = new Subject();
    twitchChannelInfoSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      bitInfo$: bitInfoSubject,
      redeemInfo$: redeemInfoSubject,
      subscriptions$: subscriptionsSubject,
      settings$: twitchSettingsSubject,
      token$: twitchTokenSubject,
      channelInfo$: twitchChannelInfoSubject,
    });

    audioServiceStub = jasmine.createSpyObj('AudioService', ['']);
    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    openaiSettingsSubject = new Subject();

    openaiServiceStub = jasmine.createSpyObj('OpenAIService', [''], {
      settings$: openaiSettingsSubject,
    });

    chatServiceStub = jasmine.createSpyObj('ChatService', ['']);

    TestBed.configureTestingModule({
      providers: [
        TwitchPubSub,
        { provide: TwitchService, useValue: twitchServiceStub },
        { provide: AudioService, useValue: audioServiceStub },
        { provide: LogService, useValue: logServiceStub },
        { provide: OpenAIService, useValue: openaiServiceStub },
        { provide: ChatService, useValue: chatServiceStub },
      ],
    });

    service = TestBed.inject(TwitchPubSub);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
