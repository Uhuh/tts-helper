import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainCommandComponent } from './chain-command.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { Subject } from 'rxjs';
import { Commands, SoundCommand } from '../../../../../shared/services/command.interface';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ChainCommandComponent', () => {
  let component: ChainCommandComponent;
  let fixture: ComponentFixture<ChainCommandComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  let commandsSubject: Subject<Commands[]>;

  const command: SoundCommand = {
    id: 'my-cool-id',
    command: '!sound',
    chainCommands: [],
    permissions: {
      payingMembers: false,
      mods: false,
      allUsers: true,
    },
    type: 'sound',
    enabled: true,
    cooldown: 1,
    fileURL: '',
  };

  beforeEach(() => {
    commandsSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      commands$: commandsSubject,
    });

    TestBed.overrideComponent(ChainCommandComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ChainCommandComponent);
    component = fixture.componentInstance;

    component.command = command;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
