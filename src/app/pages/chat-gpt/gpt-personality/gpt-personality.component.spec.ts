import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptPersonalityComponent } from './gpt-personality.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

xdescribe('GptPersonalityComponent', () => {
  let component: GptPersonalityComponent;
  let fixture: ComponentFixture<GptPersonalityComponent>;

  beforeEach(() => {
    TestBed.overrideComponent(GptPersonalityComponent, {
      set: {
        imports: [CommonModule, ReactiveFormsModule],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(GptPersonalityComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
