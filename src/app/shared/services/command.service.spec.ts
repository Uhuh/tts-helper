import { TestBed } from '@angular/core/testing';
import { CommandService } from './command.service';
import { VStreamService } from './vstream.service';
import { ChatService } from './chat.service';
import { LogService } from './logs.service';
import { AudioService } from './audio.service';
import { Subject } from 'rxjs';
import { Commands } from './command.interface';

describe('CommandService', () => {
  let service: CommandService;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;
  let chatServiceStub: jasmine.SpyObj<ChatService>;
  let logServiceStub: jasmine.SpyObj<LogService>;
  let audioServiceStub: jasmine.SpyObj<AudioService>;

  let commandsSubject: Subject<Commands[]>;

  beforeEach(() => {
    commandsSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      commands$: commandsSubject,
    });
    
    chatServiceStub = jasmine.createSpyObj('ChatService', ['']);
    logServiceStub = jasmine.createSpyObj('LogService', ['']);
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
});
