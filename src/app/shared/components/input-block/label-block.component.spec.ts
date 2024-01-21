import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelBlockComponent } from './label-block.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('InputBlockComponent', () => {
  let component: LabelBlockComponent;
  let fixture: ComponentFixture<LabelBlockComponent>;

  beforeEach(() => {
    TestBed.overrideComponent(LabelBlockComponent, {
      set: {
        imports: [],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(LabelBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
