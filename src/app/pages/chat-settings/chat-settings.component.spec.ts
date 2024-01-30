import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSettingsComponent } from './chat-settings.component';
import { ConfigService } from '../../shared/services/config.service';
import { OpenAIService } from '../../shared/services/openai.service';
import { Subject } from 'rxjs';
import { GptChatState } from '../../shared/state/openai/openai.feature';
import { GeneralChatState } from '../../shared/state/config/config.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ChatSettingsComponent', () => {
  let component: ChatSettingsComponent;
  let fixture: ComponentFixture<ChatSettingsComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;
  let openaiServiceStub: jasmine.SpyObj<OpenAIService>;

  let chatSubject: Subject<GptChatState>;
  let generalChatSubject: Subject<GeneralChatState>;

  beforeEach(() => {
    generalChatSubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      generalChat$: generalChatSubject,
    });

    chatSubject = new Subject();

    openaiServiceStub = jasmine.createSpyObj('OpenAIService', [''], {
      chatSettings$: chatSubject,
    });

    TestBed.overrideComponent(ChatSettingsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ConfigService, useValue: configServiceStub },
          { provide: OpenAIService, useValue: openaiServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ChatSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
