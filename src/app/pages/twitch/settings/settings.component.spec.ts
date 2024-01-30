import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { TwitchService } from '../../../shared/services/twitch.service';
import { Subject } from 'rxjs';
import { TwitchSettingsState } from '../../../shared/state/twitch/twitch.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TwitchSettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;

  let settingsSubject: Subject<TwitchSettingsState>;

  beforeEach(() => {
    settingsSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      settings$: settingsSubject,
    });

    TestBed.overrideComponent(SettingsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: TwitchService, useValue: twitchServiceStub },
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
