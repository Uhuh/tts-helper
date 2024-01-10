import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextCommandComponent } from './text-command.component';

describe('TextCommandComponent', () => {
  let component: TextCommandComponent;
  let fixture: ComponentFixture<TextCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextCommandComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TextCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
