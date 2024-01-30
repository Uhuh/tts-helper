import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { AudioService } from '../../shared/services/audio.service';
import { ConfigService } from '../../shared/services/config.service';
import { Subject } from 'rxjs';
import { TtsType } from '../../shared/state/config/config.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GeneralSettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  let audioServiceStub: jasmine.SpyObj<AudioService>;
  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let ttsSubject: Subject<TtsType>;

  beforeEach(() => {
    audioServiceStub = jasmine.createSpyObj('AudioService', ['playTts']);

    ttsSubject = new Subject();
    configServiceStub = jasmine.createSpyObj('ConfigService', ['updateTts'], {
      configTts$: ttsSubject,
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
    component.selectTts(tts);

    // Assert
    expect(configServiceStub.updateTts).toHaveBeenCalledOnceWith(tts);
  });

  it('should speak given text', () => {
    // Arrange
    const text = 'Hello World';
    component.ttsControl.setValue(text);

    // Act
    component.speak();

    // Assert
    expect(audioServiceStub.playTts).toHaveBeenCalledOnceWith(text, '', 'tts-helper', 1000);
  });
});
