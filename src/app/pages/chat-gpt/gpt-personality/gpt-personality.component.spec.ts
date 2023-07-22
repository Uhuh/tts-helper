import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptPersonalityComponent } from './gpt-personality.component';

describe('GptPersonalityComponent', () => {
  let component: GptPersonalityComponent;
  let fixture: ComponentFixture<GptPersonalityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GptPersonalityComponent]
    });
    fixture = TestBed.createComponent(GptPersonalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
