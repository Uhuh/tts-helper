import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerationComponent } from './moderation.component';
import { ConfigService } from '../../shared/services/config.service';
import { LogService } from '../../shared/services/logs.service';
import { Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ModerationComponent', () => {
  let component: ModerationComponent;
  let fixture: ComponentFixture<ModerationComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  let bannedWordsSubject: Subject<string[]>;

  beforeEach(() => {
    bannedWordsSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      bannedWords$: bannedWordsSubject,
    });
    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.overrideComponent(ModerationComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ConfigService, useValue: configServiceStub },
          { provide: LogService, useValue: logServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
