import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { AudioService } from '../../shared/services/audio.service';
import { ConfigService } from '../../shared/services/config.service';
import { BehaviorSubject } from 'rxjs';
import { TtsType } from '../../shared/state/config/config.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GeneralSettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let ttsSubject: BehaviorSubject<TtsType>;
  let stateSubject: BehaviorSubject<{ chaosMode: boolean }>;

  beforeEach(() => {
    audioServiceStub = jasmine.createSpyObj('AudioService', ['playTts']);

    ttsSubject = new BehaviorSubject<TtsType>('streamlabs');
    stateSubject = new BehaviorSubject<{ chaosMode: boolean }>({ chaosMode: false });
    configServiceStub = jasmine.createSpyObj('ConfigService', ['updateState'], {
      configTts$: ttsSubject,
      state$: stateSubject,
    });

    TestBed.overrideComponent(SettingsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: AudioService, useValue: audioServiceStub },
          { provide: ConfigService, useValue: configServiceStub },
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

  it('should update tts', () => {
    // Arrange
    const tts: TtsType = 'tts-monster';

    // Act
    component.selectedTts.setValue(tts);

    // Assert
    expect(configServiceStub.updateState).toHaveBeenCalledWith({ tts });
  });

  it('should speak given text', () => {
    // Arrange
    const text = 'Hello World';
    component.ttsControl.setValue(text);

    // Act
    component.speak();

    // Assert
    expect(audioServiceStub.playTts).toHaveBeenCalledOnceWith(text, '', 'tts-helper', 1000, true, true);
  });
});
