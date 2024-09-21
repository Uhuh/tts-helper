import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsMonsterComponent } from './tts-monster.component';
import { ConfigService } from '../../../shared/services/config.service';
import { Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TtsMonsterComponent', () => {
  let component: TtsMonsterComponent;
  let fixture: ComponentFixture<TtsMonsterComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    configServiceStub = jasmine.createSpyObj('ConfigService', ['']);

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
