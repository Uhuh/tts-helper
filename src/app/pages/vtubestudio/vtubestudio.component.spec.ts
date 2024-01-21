import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VtubestudioComponent } from './vtubestudio.component';
import { VTubeStudioService } from '../../shared/services/vtubestudio.service';
import { ConfigService } from '../../shared/services/config.service';
import { Subject } from 'rxjs';
import { AuthTokens } from '../../shared/state/config/config.feature';
import { VTubeStudioState } from '../../shared/state/vtubestudio/vtubestudio.feature.';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VtubestudioComponent', () => {
  let component: VtubestudioComponent;
  let fixture: ComponentFixture<VtubestudioComponent>;

  let vtubeStudioServiceStub: jasmine.SpyObj<VTubeStudioService>;
  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let vtubeStateSubject: Subject<VTubeStudioState>;
  let authTokensSubject: Subject<AuthTokens>;

  beforeEach(() => {
    vtubeStateSubject = new Subject();

    vtubeStudioServiceStub = jasmine.createSpyObj('VTubeStudioService', [''], {
      state$: vtubeStateSubject,
    });

    authTokensSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      authTokens$: authTokensSubject,
    });

    TestBed.overrideComponent(VtubestudioComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: VTubeStudioService, useValue: vtubeStudioServiceStub },
          { provide: ConfigService, useValue: configServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(VtubestudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
