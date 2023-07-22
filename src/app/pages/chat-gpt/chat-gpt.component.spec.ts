import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGptComponent } from './chat-gpt.component';

describe('ChatGptComponent', () => {
  let component: ChatGptComponent;
  let fixture: ComponentFixture<ChatGptComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatGptComponent]
    });
    fixture = TestBed.createComponent(ChatGptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
