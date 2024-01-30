import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthComponent } from './auth.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { LogService } from '../../../shared/services/logs.service';
import { of, Subject } from 'rxjs';
import { VStreamToken } from '../../../shared/state/vstream/vstream.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VStreamAuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;
  let logServiceStub: jasmine.SpyObj<LogService>;

  let tokenSubject: Subject<VStreamToken>;
  let isTokenValidSubject: Subject<boolean>;

  beforeEach(() => {
    tokenSubject = new Subject();
    isTokenValidSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['getLoginURL'], {
      token$: tokenSubject,
      isTokenValid$: isTokenValidSubject,
    });
    vstreamServiceStub.getLoginURL.and.returnValue(of(''));

    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.overrideComponent(AuthComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
          { provide: LogService, useValue: logServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
