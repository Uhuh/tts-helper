import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemsComponent } from './redeems.component';
import { TwitchService } from '../../../shared/services/twitch.service';
import { OpenAIService } from '../../../shared/services/openai.service';
import { Subject } from 'rxjs';
import { TwitchRedeemInfo, TwitchRedeemState } from '../../../shared/state/twitch/twitch.feature';
import { AsyncPipe } from '@angular/common';

describe('RedeemsComponent', () => {
  let component: RedeemsComponent;
  let fixture: ComponentFixture<RedeemsComponent>;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;
  let openaiServiceStub: jasmine.SpyObj<OpenAIService>;

  let redeemsSubject: Subject<TwitchRedeemInfo[]>;
  let redeemsInfoSubject: Subject<TwitchRedeemState>;

  beforeEach(() => {
    redeemsSubject = new Subject();
    redeemsInfoSubject = new Subject();

    twitchServiceStub = jasmine.createSpyObj('TwitchService', [''], {
      redeems$: redeemsSubject,
      redeemInfo$: redeemsInfoSubject,
    });
    openaiServiceStub = jasmine.createSpyObj('OpenAIService', ['']);

    TestBed.overrideComponent(RedeemsComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: TwitchService, useValue: twitchServiceStub },
          { provide: OpenAIService, useValue: openaiServiceStub },
        ],
      },
    });

    fixture = TestBed.createComponent(RedeemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
