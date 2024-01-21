import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandsComponent } from './commands.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';

describe('ChatCommandsComponent', () => {
  let component: CommandsComponent;
  let fixture: ComponentFixture<CommandsComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(CommandsComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(CommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
