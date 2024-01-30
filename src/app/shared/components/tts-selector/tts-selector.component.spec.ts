import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsSelectorComponent } from './tts-selector.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TtsSelectorComponent', () => {
  let component: TtsSelectorComponent;
  let fixture: ComponentFixture<TtsSelectorComponent>;

  beforeEach(() => {
    TestBed.overrideComponent(TtsSelectorComponent, {
      set: {
        imports: [],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(TtsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
