import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayLabelComponent } from './display-label.component';

describe('DisplayLabelComponent', () => {
  let component: DisplayLabelComponent;
  let fixture: ComponentFixture<DisplayLabelComponent>;

  beforeEach(() => {
    TestBed.overrideComponent(DisplayLabelComponent, {
      set: {
        imports: [],
      },
    });

    fixture = TestBed.createComponent(DisplayLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
