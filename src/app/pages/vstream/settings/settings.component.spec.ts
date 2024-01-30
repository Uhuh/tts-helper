import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { Subject } from 'rxjs';
import { VStreamSettingsState } from '../../../shared/state/vstream/vstream.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VStreamSettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  let settingsSubject: Subject<VStreamSettingsState>;

  beforeEach(() => {
    settingsSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      settings$: settingsSubject,
    });

    TestBed.overrideComponent(SettingsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
