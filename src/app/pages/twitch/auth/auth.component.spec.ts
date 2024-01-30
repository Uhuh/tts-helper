import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthComponent } from './auth.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { TwitchService } from '../../../shared/services/twitch.service';
import { Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TwitchAuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;
  let twitchServiceStub: jasmine.SpyObj<TwitchService>;

  let isTokenValidSubject: Subject<boolean>;
  let tokenSubject: Subject<string | null>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    isTokenValidSubject = new Subject();
    tokenSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      isTokenValid$: isTokenValidSubject,
      token$: tokenSubject,
    });

    TestBed.overrideComponent(AuthComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
          { provide: TwitchService, useValue: twitchServiceStub },
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
