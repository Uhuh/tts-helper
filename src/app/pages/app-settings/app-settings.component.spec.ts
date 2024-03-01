import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSettingsComponent } from './app-settings.component';
import { AppSettingsService } from '../../shared/services/app-settings.service';
import { Subject } from 'rxjs';
import { AppSettingsFeatureState } from '../../shared/state/app-settings/app-settings.feature';

describe('AppSettingsComponent', () => {
  let component: AppSettingsComponent;
  let fixture: ComponentFixture<AppSettingsComponent>;

  let appSettingsServiceStub: jasmine.SpyObj<AppSettingsService>;

  let connectionsSubject: Subject<AppSettingsFeatureState['connections']>;

  beforeEach(() => {
    connectionsSubject = new Subject();
    appSettingsServiceStub = jasmine.createSpyObj('AppSettingsService', [''], {
      connections$: connectionsSubject,
    });

    TestBed.overrideComponent(AppSettingsComponent, {
      set: {
        providers: [
          { provide: AppSettingsService, useValue: appSettingsServiceStub },
        ],
      },
    });

    fixture = TestBed.createComponent(AppSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
