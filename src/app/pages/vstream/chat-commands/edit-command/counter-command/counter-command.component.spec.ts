import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterCommandComponent } from './counter-command.component';

describe('CounterCommandComponent', () => {
  let component: CounterCommandComponent;
  let fixture: ComponentFixture<CounterCommandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterCommandComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CounterCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
