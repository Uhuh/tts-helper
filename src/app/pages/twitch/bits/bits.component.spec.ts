import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitsComponent } from './bits.component';
import { TwitchService } from '../../../shared/services/twitch.service';
import { Subject } from 'rxjs';
import { TwitchBitState } from '../../../shared/state/twitch/twitch.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BitsComponent', () => {
  let component: BitsComponent;
  let fixture: ComponentFixture<BitsComponent>;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;

  let bifInfoSubject: Subject<TwitchBitState>;

  beforeEach(() => {
    bifInfoSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      bitInfo$: bifInfoSubject,
    });

    TestBed.overrideComponent(BitsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: TwitchService, useValue: twitchServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(BitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
