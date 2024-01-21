import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChainCommandComponent } from './edit-chain-command.component';
import { VStreamService } from '../../../../../../shared/services/vstream.service';
import { Subject } from 'rxjs';
import { ChainCommand, Commands } from '../../../../../../shared/services/command.interface';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';

describe('EditChainCommandComponent', () => {
  let component: EditChainCommandComponent;
  let fixture: ComponentFixture<EditChainCommandComponent>;

  const parentCommandID = 'my-parent-id';
  const chainCommand: ChainCommand = {
    chainCommandID: '1234',
    chainCommandDelay: 1,
    id: 'my-cool-id',
  };

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  let commandsSubject: Subject<Commands[]>;

  beforeEach(() => {
    commandsSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      commands$: commandsSubject,
    });

    TestBed.overrideComponent(EditChainCommandComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(EditChainCommandComponent);
    component = fixture.componentInstance;

    component.chainCommand = chainCommand;
    component.parentCommandID = parentCommandID;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
