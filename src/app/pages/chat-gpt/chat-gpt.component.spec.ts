import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGptComponent } from './chat-gpt.component';
import { OpenAIService } from '../../shared/services/openai.service';
import { Subject } from 'rxjs';
import { GptChatState, GptPersonalityState, GptSettingsState } from '../../shared/state/openai/openai.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';

describe('ChatGptComponent', () => {
  let component: ChatGptComponent;
  let fixture: ComponentFixture<ChatGptComponent>;

  let openaiServiceStub: jasmine.SpyObj<OpenAIService>;

  let personalitySubject: Subject<GptPersonalityState>;
  let settingsSubject: Subject<GptSettingsState>;
  let chatSubject: Subject<GptChatState>;

  beforeEach(() => {
    personalitySubject = new Subject();
    settingsSubject = new Subject();
    chatSubject = new Subject();

    openaiServiceStub = jasmine.createSpyObj('OpenAIService', [''], {
      personality$: personalitySubject,
      settings$: settingsSubject,
      chatSettings$: chatSubject,
    });

    TestBed.overrideComponent(ChatGptComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: OpenAIService, useValue: openaiServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ChatGptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
