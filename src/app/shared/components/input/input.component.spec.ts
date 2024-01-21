import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent<string>;
  let fixture: ComponentFixture<InputComponent<string>>;

  beforeEach(async () => {
    TestBed.overrideComponent(InputComponent, {
      set: {
        imports: [],
      },
    });

    fixture = TestBed.createComponent(InputComponent<string>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
