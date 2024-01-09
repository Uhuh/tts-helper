import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceCommandComponent } from './choice-command.component';

describe('ChoiceCommandComponent', () => {
  let component: ChoiceCommandComponent;
  let fixture: ComponentFixture<ChoiceCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceCommandComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChoiceCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
