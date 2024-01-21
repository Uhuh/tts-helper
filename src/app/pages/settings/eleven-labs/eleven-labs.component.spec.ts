import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElevenLabsComponent } from './eleven-labs.component';
import { ElevenLabsService } from '../../../shared/services/eleven-labs.service';
import { Subject } from 'rxjs';
import { ElevenLabsState } from '../../../shared/state/eleven-labs/eleven-labs.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ElevenLabsComponent', () => {
  let component: ElevenLabsComponent;
  let fixture: ComponentFixture<ElevenLabsComponent>;

  let elevenLabsServiceStub: jasmine.SpyObj<ElevenLabsService>;

  let stateSubject: Subject<ElevenLabsState>;

  beforeEach(() => {
    stateSubject = new Subject();

    elevenLabsServiceStub = jasmine.createSpyObj('ElevenLabsService', [''], {
      state$: stateSubject,
    });

    TestBed.overrideComponent(ElevenLabsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ElevenLabsService, useValue: elevenLabsServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ElevenLabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
