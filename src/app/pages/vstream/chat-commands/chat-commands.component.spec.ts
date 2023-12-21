import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatCommandsComponent } from './chat-commands.component';

describe('ChatCommandsComponent', () => {
  let component: ChatCommandsComponent;
  let fixture: ComponentFixture<ChatCommandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatCommandsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
