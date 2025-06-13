import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundCommandComponent } from './sound-command.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SoundCommand } from '../../../../../shared/services/command.interface';

describe('SoundComponentComponent', () => {
  let component: SoundCommandComponent;
  let fixture: ComponentFixture<SoundCommandComponent>;

  const command: SoundCommand = {
    id: 'my-sound-command',
    command: '!sound',
    fileURL: '',
    cooldown: 1,
    type: 'sound',
    enabled: true,
    chainCommands: [],
    permissions: {
      allUsers: true,
      mods: false,
      payingMembers: false,
    },
  };

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    TestBed.overrideComponent(SoundCommandComponent, {
      set: {
        imports: [],
        providers: [
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(SoundCommandComponent);
    component = fixture.componentInstance;

    component.command = command;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
