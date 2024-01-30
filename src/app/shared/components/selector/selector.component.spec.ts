import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorComponent } from './selector.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SelectorComponent', () => {
  let component: SelectorComponent<string>;
  let fixture: ComponentFixture<SelectorComponent<string>>;

  beforeEach(() => {
    TestBed.overrideComponent(SelectorComponent, {
      set: {
        imports: [],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(SelectorComponent<string>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
