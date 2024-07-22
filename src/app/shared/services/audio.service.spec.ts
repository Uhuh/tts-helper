import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AudioService } from './audio.service';
import { MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { AudioFeature } from '../state/audio/audio.feature';
import { ConfigService } from './config.service';
import { PlaybackService } from './playback.service';
import { ElevenLabsService } from './eleven-labs.service';
import { TwitchService } from './twitch.service';
import { LogService } from './logs.service';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  AmazonPollyData,
  CustomUserVoice,
  StreamElementsData,
  TikTokData,
  TtsMonsterData,
  TtsType,
  UserListState,
} from '../state/config/config.feature';
import { ElevenLabsState } from '../state/eleven-labs/eleven-labs.feature';
import { TwitchState } from '../state/twitch/twitch.feature';
import { RequestAudioData } from './playback.interface';


describe('AudioService', () => {
  let service: AudioService;
  let store: MockStore;

  const text = 'Hello world!';
  const username = 'panku';

  let configServiceStub: jasmine.SpyObj<ConfigService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;
  let elevenlabServiceStub: jasmine.SpyObj<ElevenLabsService>;
  let twitchServiceStub: jasmine.SpyObj<TwitchService>;
  let logsServiceStub: jasmine.SpyObj<LogService>;

  let configAudioSettingsSubject: Subject<{
    bannedWords: string[];
    tts: TtsType;
    streamElements: StreamElementsData;
    ttsMonster: TtsMonsterData;
    amazonPolly: AmazonPollyData;
    tikTok: TikTokData;
    elevenLabs: ElevenLabsState;
  }>;

  let customUserVoicesSubject: Subject<CustomUserVoice[]>;
  let twitchSettingsSubject: Subject<TwitchState>;
  let elevenlabsStateSubject: Subject<ElevenLabsState>;
  let audioStartedSubject: Subject<number>;
  let audioFinishedSubject: Subject<number>;
  let userListStateSubject: BehaviorSubject<UserListState>;

  beforeEach(() => {
    configAudioSettingsSubject = new Subject();
    customUserVoicesSubject = new BehaviorSubject<CustomUserVoice[]>([]);
    userListStateSubject = new BehaviorSubject<UserListState>({
      usernames: [],
      shouldBlockUser: true,
    });

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      audioSettings$: configAudioSettingsSubject,
      userListState$: userListStateSubject,
      customUserVoices$: customUserVoicesSubject,
    });

    audioStartedSubject = new Subject();
    audioFinishedSubject = new Subject();

    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['playAudio'], {
      audioStarted$: audioStartedSubject,
      audioFinished$: audioFinishedSubject,
    });
    playbackServiceStub.playAudio.and.returnValue(Promise.resolve(1));

    elevenlabsStateSubject = new Subject();

    elevenlabServiceStub = jasmine.createSpyObj('ElevenLabsService', [''], {
      state$: elevenlabsStateSubject,
    });

    twitchSettingsSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      settings$: twitchSettingsSubject,
    });

    logsServiceStub = jasmine.createSpyObj('LogService', ['add']);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(AudioFeature),
      ],
      providers: [
        AudioService,
        { provide: ConfigService, useValue: configServiceStub },
        { provide: PlaybackService, useValue: playbackServiceStub },
        { provide: ElevenLabsService, useValue: elevenlabServiceStub },
        { provide: TwitchService, useValue: twitchServiceStub },
        { provide: LogService, useValue: logsServiceStub },
        { provide: MockStore, useValue: store },
      ],
    });

    service = TestBed.inject(AudioService);
    store = TestBed.inject(MockStore);

    service.bannedWords = [];

    service.tts = 'stream-elements';
    service.streamElements = {
      voice: 'brian',
      language: 'english',
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should play audio', fakeAsync(() => {
    // Arrange
    const requestData: RequestAudioData = {
      type: 'streamElements',
      voice: service.streamElements.voice,
      text,
    };

    const userListState: UserListState = {
      shouldBlockUser: true,
      usernames: [],
    };

    // Act
    userListStateSubject.next(userListState);
    customUserVoicesSubject.next([]);

    service.playTts(text, username, 'vstream', 9999);

    tick(200);

    // Assert
    expect(playbackServiceStub.playAudio).toHaveBeenCalledOnceWith({ data: requestData });
  }));

  it('should prevent banned messages from playing tts', fakeAsync(() => {
    // Arrange
    service.bannedWords = ['hello', 'world'];

    const userListState: UserListState = {
      shouldBlockUser: true,
      usernames: [],
    };

    // Act
    userListStateSubject.next(userListState);
    customUserVoicesSubject.next([]);

    service.playTts(text, username, 'vstream', 9999);

    tick(200);

    // Assert
    expect(playbackServiceStub.playAudio).toHaveBeenCalledTimes(0);
  }));

  it('should prevent blocked users from playing tts', fakeAsync(() => {
    // Arrange
    const userListState: UserListState = {
      shouldBlockUser: true,
      usernames: [username],
    };

    // Act
    userListStateSubject.next(userListState);
    customUserVoicesSubject.next([]);

    service.playTts(text, username, 'vstream', 9999);

    tick(200);

    // Assert
    expect(playbackServiceStub.playAudio).toHaveBeenCalledTimes(0);
  }));

  it('should play "allowed" users tts request', fakeAsync(() => {
    // Arrange
    const userListState: UserListState = {
      shouldBlockUser: false,
      usernames: [username],
    };
    const userVoices: CustomUserVoice[] = [
      {
        voice: 'ayo',
        username: 'pankurs',
        language: 'english',
        ttsType: 'tiktok',
        id: '1234',
      },
    ];

    // Act
    userListStateSubject.next(userListState);
    customUserVoicesSubject.next(userVoices);

    service.playTts(text, username, 'twitch', 9999);
    tick(200);

    // Assert
    expect(playbackServiceStub.playAudio).toHaveBeenCalled();
  }));

  it('should play users custom tts', fakeAsync(() => {
    // Arrange
    const voice = 'brian';
    const userListState: UserListState = {
      shouldBlockUser: false,
      usernames: [username],
    };
    const userVoices: CustomUserVoice[] = [
      {
        voice,
        username: 'pankurs',
        language: 'english',
        ttsType: 'stream-elements',
        id: '1234',
      },
    ];

    // Act
    userListStateSubject.next(userListState);
    customUserVoicesSubject.next(userVoices);

    service.playTts(text, username, 'twitch', 9999);
    tick(200);

    // Assert
    expect(playbackServiceStub.playAudio).toHaveBeenCalledOnceWith({
      data: {
        text,
        voice,
        type: 'streamElements',
      },
    });
  }));
});
