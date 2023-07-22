import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSettingsComponent } from './chat-settings.component';

describe('ChatSettingsComponent', () => {
  let component: ChatSettingsComponent;
  let fixture: ComponentFixture<ChatSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatSettingsComponent]
    });
    fixture = TestBed.createComponent(ChatSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
