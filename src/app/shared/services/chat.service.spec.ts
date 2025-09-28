import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { ConfigService } from './config.service';
import { OpenAIService } from './openai.service';
import { AudioService } from './audio.service';
import { Subject } from 'rxjs';
import { GeneralChatState } from '../state/config/config.feature';
import { GptChatState } from '../state/openai/openai.feature';
import { ChatPermissions, ChatUserMessage, UserPermissions } from './chat.interface';

describe('ChatService', () => {
  let service: ChatService;

  const generalConfig: GeneralChatState = {
    charLimit: 300,
    command: '!say',
    cooldown: 10,
    enabled: true,
    permissions: {
      allUsers: false,
      mods: false,
      payingMembers: false,
    },
  };

  const gptConfig: GptChatState = {
    charLimit: 300,
    command: '!ask',
    cooldown: 10,
    enabled: true,
    permissions: {
      allUsers: false,
      mods: false,
      payingMembers: false,
    },
  };

  let message: ChatUserMessage;

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

    openaiServiceStub = jasmine.createSpyObj('OpenAIService', ['playOpenAIResponse'], {
      chatSettings$: openaiChatSubject,
    });

    audioServiceStub = jasmine.createSpyObj('AudioService', ['playTts', 'canProcessMessage']);

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: ConfigService, useValue: configServiceStub },
        { provide: OpenAIService, useValue: openaiServiceStub },
        { provide: AudioService, useValue: audioServiceStub },
      ],
    });

    service = TestBed.inject(ChatService);
    service.generalChat = generalConfig;
    service.openAIChat = gptConfig;

    message = {
      displayName: 'panku',
      text: `${generalConfig.command} Hello world!`,
      permissions: {
        isMod: false,
        isPayingMember: false,
        isBroadcaster: false,
      },
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should playTts chat command', () => {
    // Arrange
    service.openAIChat.enabled = false;
    // Allow all users to use this command.
    service.generalChat.permissions.allUsers = true;

    // Act
    service.onMessage(message, 'vstream');

    // Assert
    expect(audioServiceStub.playTts).toHaveBeenCalled();
  });

  it('should playOpenAIResponse for chat command', () => {
    // Arrange
    service.openAIChat.enabled = true;
    service.openAIChat.permissions.allUsers = true;
    message.text = `${gptConfig.command} How're you?`;

    // Act
    service.onMessage(message, 'vstream');

    // Assert
    expect(openaiServiceStub.playOpenAIResponse).toHaveBeenCalled();
  });

  it('should set general command cooldown and unset after its finished', (done) => {
    // Arrange
    service.openAIChat.enabled = false;
    // Allow all users to use this command.
    service.generalChat.permissions.allUsers = true;
    const duration = 1;
    service.generalChat.cooldown = duration;

    // Act
    service.onMessage(message, 'vstream');

    // Expect
    expect(service.cooldowns.size).toBe(1);
    expect(service.cooldowns.get(`vstream-general`)).toBeTrue();

    // Make sure that the cooldown gets reset after it expires.
    setTimeout(() => {
      expect(service.cooldowns.get('vstream-general')).toBeFalse();
      done();
    }, duration + 1000);
  });

  describe('randomChance', () => {
    const message = {
      text: 'Hello world',
      displayName: 'panku',
    };

    it('should not message on failed random chance', () => {
      // Act
      service.randomChance(message, 0, false, 'vstream');

      // Assert
      expect(audioServiceStub.playTts).toHaveBeenCalledTimes(0);
      // Even though we said false to useOpenAI, make sure it's not calling it.
      expect(openaiServiceStub.playOpenAIResponse).toHaveBeenCalledTimes(0);
    });

    it('should playTts when random chance passes', () => {
      // Act
      service.randomChance(message, 100, false, 'vstream');

      // Assert
      expect(audioServiceStub.playTts).toHaveBeenCalled();
      // Even though we said false to useOpenAI, make sure it's not calling it.
      expect(openaiServiceStub.playOpenAIResponse).toHaveBeenCalledTimes(0);
    });

    it('should playOpenAIResponse when random chance passes', () => {
      // Act
      service.randomChance(message, 100, true, 'vstream');

      // Assert
      expect(openaiServiceStub.playOpenAIResponse).toHaveBeenCalled();
      // Make sure only openAI is being run.
      expect(audioServiceStub.playTts).toHaveBeenCalledTimes(0);
    });
  });

  describe('hasChatCommandPermissions', () => {
    let userPerms: UserPermissions;
    let chatPerms: ChatPermissions;

    beforeEach(() => {
      userPerms = {
        isMod: false,
        isBroadcaster: false,
        isPayingMember: false,
      };

      chatPerms = {
        mods: false,
        allUsers: false,
        payingMembers: false,
      };
    });

    it('should allow broadcasters to run commands', () => {
      // Arrange
      userPerms.isBroadcaster = true;

      // Act
      const hasPerms = service.hasChatCommandPermissions({ permissions: userPerms }, chatPerms);

      // Assert
      expect(hasPerms).toBeTrue();
    });

    it('should allow all users to run commands', () => {
      // Arrange
      chatPerms.allUsers = true;

      // Act
      const hasPerms = service.hasChatCommandPermissions({ permissions: userPerms }, chatPerms);

      // Assert
      expect(hasPerms).toBeTrue();
    });

    it('should allow mods to run commands', () => {
      // Arrange
      userPerms.isMod = true;
      chatPerms.mods = true;

      // Act
      const hasPerms = service.hasChatCommandPermissions({ permissions: userPerms }, chatPerms);

      // Assert
      expect(hasPerms).toBeTrue();
    });

    it('should allow paying users to run commands', () => {
      // Arrange
      userPerms.isPayingMember = true;
      chatPerms.payingMembers = true;

      // Act
      const hasPerms = service.hasChatCommandPermissions({ permissions: userPerms }, chatPerms);

      // Assert
      expect(hasPerms).toBeTrue();
    });

    it('should not allow paying users to run commands if only mods are allowed', () => {
      // Arrange
      userPerms.isPayingMember = true;
      chatPerms.mods = true;

      // Act
      const hasPerms = service.hasChatCommandPermissions({ permissions: userPerms }, chatPerms);

      // Assert
      expect(hasPerms).toBeFalse();
    });

    it('should be false for no matching permissions', () => {
      // Act
      const hasPerms = service.hasChatCommandPermissions({ permissions: userPerms }, chatPerms);

      // Assert
      expect(hasPerms).toBeFalse();
    });
  });
});
