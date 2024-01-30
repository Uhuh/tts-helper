import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiktokComponent } from './tiktok.component';
import { ConfigService } from '../../../shared/services/config.service';
import { Subject } from 'rxjs';
import { TikTokData } from '../../../shared/state/config/config.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TiktokComponent', () => {
  let component: TiktokComponent;
  let fixture: ComponentFixture<TiktokComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let tiktokSubject: Subject<TikTokData>;

  beforeEach(() => {

    tiktokSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      tikTok$: tiktokSubject,
    });

    TestBed.overrideComponent(TiktokComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ConfigService, useValue: configServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(TiktokComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
