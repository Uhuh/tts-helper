import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamElementsComponent } from './stream-elements.component';
import { ConfigService } from '../../../shared/services/config.service';
import { Subject } from 'rxjs';
import { StreamElementsData } from '../../../shared/state/config/config.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StreamelementTtsComponent', () => {
  let component: StreamElementsComponent;
  let fixture: ComponentFixture<StreamElementsComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let streamelementsSubject: Subject<StreamElementsData>;

  beforeEach(() => {
    streamelementsSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      streamElements$: streamelementsSubject,
    });

    TestBed.overrideComponent(StreamElementsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ConfigService, useValue: configServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(StreamElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
