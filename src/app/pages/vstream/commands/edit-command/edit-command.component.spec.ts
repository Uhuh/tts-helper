import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCommandComponent } from './edit-command.component';
import { VStreamService } from '../../../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import { SoundCommand } from '../../../../shared/services/command.interface';

describe('EditCommandComponent', () => {
  let component: EditCommandComponent;
  let fixture: ComponentFixture<EditCommandComponent>;

  let vstreamService: jasmine.SpyObj<VStreamService>;

  const command: SoundCommand = {
    command: '!sound',
    chainCommands: [],
    fileURL: '',
    cooldown: 1,
    enabled: true,
    type: 'sound',
    id: 'my-cool-id',
    permissions: {
      allUsers: true,
      mods: false,
      payingMembers: false,
    },
  };

  beforeEach(() => {
    vstreamService = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(EditCommandComponent, {
      set: {
        imports: [CdkAccordionModule, CommonModule],
        providers: [
          { provide: VStreamService, useValue: vstreamService },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(EditCommandComponent);
    component = fixture.componentInstance;

    component.command = command;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
