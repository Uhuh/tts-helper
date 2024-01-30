import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsComponent } from './subs.component';
import { TwitchService } from '../../../shared/services/twitch.service';
import { Subject } from 'rxjs';
import { TwitchSubState } from '../../../shared/state/twitch/twitch.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SubsComponent', () => {
  let component: SubsComponent;
  let fixture: ComponentFixture<SubsComponent>;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;

  let subsSubject: Subject<TwitchSubState>;

  beforeEach(() => {
    subsSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      subsInfo$: subsSubject,
    });

    TestBed.overrideComponent(SubsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: TwitchService, useValue: twitchServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(SubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
