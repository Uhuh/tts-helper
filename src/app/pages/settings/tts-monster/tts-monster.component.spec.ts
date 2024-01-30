import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsMonsterComponent } from './tts-monster.component';
import { ConfigService } from '../../../shared/services/config.service';
import { Subject } from 'rxjs';
import { TtsMonsterData } from '../../../shared/state/config/config.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TtsMonsterComponent', () => {
  let component: TtsMonsterComponent;
  let fixture: ComponentFixture<TtsMonsterComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let ttsMonsterSubject: Subject<TtsMonsterData>;

  beforeEach(() => {
    ttsMonsterSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      ttsMonster$: ttsMonsterSubject,
    });

    TestBed.overrideComponent(TtsMonsterComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ConfigService, useValue: configServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(TtsMonsterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
