import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { CommandService } from './command.service';
import { VStreamService } from './vstream.service';
import { ChatService } from './chat.service';
import { LogService } from './logs.service';
import { AudioService } from './audio.service';
import { BehaviorSubject } from 'rxjs';
import { ChainCommand, ChatCommand, Commands, CounterCommand } from './command.interface';
import { UserPermissions } from './chat.interface';

describe('CommandService', () => {
  let service: CommandService;

  const permissions = {
    mods: false,
    payingMembers: false,
    allUsers: false,
  };

  const chatCommandBasics = {
    command: '!command',
    permissions,
    chainCommands: [],
    enabled: true,
    cooldown: 10,
    autoRedeemInterval: 1,
    response: 'Some response',
  };

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;
  let chatServiceStub: jasmine.SpyObj<ChatService>;
  let logServiceStub: jasmine.SpyObj<LogService>;
  let audioServiceStub: jasmine.SpyObj<AudioService>;

  let commandsSubject: BehaviorSubject<Commands[]>;

  beforeEach(() => {
    commandsSubject = new BehaviorSubject<Commands[]>([]);

    vstreamServiceStub = jasmine.createSpyObj(
      'VStreamService',
      ['postChannelMessage', 'updateCommandSettings'],
      {
        commands$: commandsSubject,
      },
    );

    chatServiceStub = jasmine.createSpyObj('ChatService', ['hasChatCommandPermissions']);
    logServiceStub = jasmine.createSpyObj('LogService', ['add']);
    audioServiceStub = jasmine.createSpyObj('AudioService', ['']);

    TestBed.configureTestingModule({
      providers: [
        CommandService,
        { provide: VStreamService, useValue: vstreamServiceStub },
        { provide: ChatService, useValue: chatServiceStub },
        { provide: LogService, useValue: logServiceStub },
        { provide: AudioService, useValue: audioServiceStub },
      ],
    });

    service = TestBed.inject(CommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create auto run timers', () => {
    // Arrange
    const commands: ChatCommand[] = [
      {
        id: 'my-auto-command-id',
        type: 'chat',
        ...chatCommandBasics,
        autoRedeem: true,
      },
      {
        id: 'my-normal-command-id',
        type: 'chat',
        ...chatCommandBasics,
        autoRedeem: false,
      },
    ];

    // Act
    commandsSubject.next(commands);

    // Assert
    expect(service.autoredeems).toHaveSize(1);
  });

  it('should ignore command if user has incorrect permissions', () => {
    // Arrange
    const command: ChatCommand = {
      id: 'my-normal-command-id',
      type: 'chat',
      ...chatCommandBasics,
      autoRedeem: false,
    };

    const permissions: UserPermissions = {
      isBroadcaster: false,
      isPayingMember: false,
      isMod: false,
    };

    const text = 'Hello world!';

    const handleChatCommandSpy = spyOn(service, 'handleChatCommand');

    chatServiceStub.hasChatCommandPermissions.and.returnValue(false);

    // Act
    commandsSubject.next([command]);
    service.handleCommand(command, permissions, text);

    expect(handleChatCommandSpy).toHaveBeenCalledTimes(0);
  });

  it('should replace text for handleChatCommand', () => {
    // Arrange
    const command: ChatCommand = {
      id: 'my-normal-command-id',
      type: 'chat',
      ...chatCommandBasics,
      autoRedeem: false,
      response: `Hello {0}`,
    };
    const text = '!command World';

    // Act
    service.handleChatCommand(command, text);

    // Assert
    expect(vstreamServiceStub.postChannelMessage).toHaveBeenCalledOnceWith(`Hello World`);
  });

  it('should handle counter commands increments', () => {
    // Arrange
    const command: CounterCommand = {
      id: 'my-normal-command-id',
      type: 'counter',
      cooldown: 0,
      command: '!counter',
      enabled: true,
      chainCommands: [],
      permissions: {
        allUsers: true,
        payingMembers: false,
        mods: false,
      },
      amount: 1,
      value: 0,
      resetOnLaunch: false,
      response: `{value}`,
    };

    // Act
    service.handleCounterCommand(command);

    // Assert
    expect(vstreamServiceStub.updateCommandSettings).toHaveBeenCalled();
    expect(vstreamServiceStub.postChannelMessage).toHaveBeenCalledOnceWith('1');
  });

  it('should call chain commands', fakeAsync(() => {
    // Arrange
    const chain: ChatCommand = {
      id: 'my-chain-command-id',
      type: 'chat',
      ...chatCommandBasics,
      command: '!chain',
      autoRedeem: false,
    };

    const chainCommand: ChainCommand = {
      chainCommandID: chain.id,
      chainCommandDelay: 0,
      id: 'my-chain-command-union-id',
    };

    const command: ChatCommand = {
      id: 'my-normal-command-id',
      type: 'chat',
      ...chatCommandBasics,
      chainCommands: [chainCommand],
      autoRedeem: false,
    };

    const permissions: UserPermissions = {
      isBroadcaster: false,
      isPayingMember: false,
      isMod: false,
    };

    const text = 'Hello world!';

    const handleChatCommandSpy = spyOn(service, 'handleChatCommand').and.callThrough();

    chatServiceStub.hasChatCommandPermissions.and.returnValue(true);

    // Act
    commandsSubject.next([command, chain]);
    service.handleCommand(command, permissions, text);

    // Flush and tick for the chain command timers.
    flush();
    tick(500);

    expect(handleChatCommandSpy).toHaveBeenCalledTimes(2);
    expect(vstreamServiceStub.postChannelMessage).toHaveBeenCalledTimes(2);
  }));
});
