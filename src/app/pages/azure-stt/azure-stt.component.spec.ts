import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AzureSttComponent } from './azure-stt.component';
import { AzureSttService } from '../../shared/services/azure-stt.service';
import { Subject } from 'rxjs';
import { AzureState } from '../../shared/state/azure/azure.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AzureSttComponent', () => {
  let component: AzureSttComponent;
  let fixture: ComponentFixture<AzureSttComponent>;

  let azuresttServiceStub: jasmine.SpyObj<AzureSttService>;

  let stateSubject: Subject<AzureState>;

  beforeEach(() => {
    stateSubject = new Subject();

    azuresttServiceStub = jasmine.createSpyObj('AzureSTTService', [''], {
      state$: stateSubject,
    });

    TestBed.overrideComponent(AzureSttComponent, {
      set: {
        imports: [],
        providers: [
          { provide: AzureSttService, useValue: azuresttServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(AzureSttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
