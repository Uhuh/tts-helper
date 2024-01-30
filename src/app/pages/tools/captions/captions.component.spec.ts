import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptionsComponent } from './captions.component';
import { TwitchService } from '../../../shared/services/twitch.service';
import { Subject } from 'rxjs';
import { TwitchChannelInfo } from '../../../shared/state/twitch/twitch.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CaptionsComponent', () => {
  let component: CaptionsComponent;
  let fixture: ComponentFixture<CaptionsComponent>;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;

  let channelInfoSubject: Subject<TwitchChannelInfo>;

  beforeEach(() => {
    channelInfoSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      channelInfo$: channelInfoSubject,
    });

    TestBed.overrideComponent(CaptionsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: TwitchService, useValue: twitchServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(CaptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
