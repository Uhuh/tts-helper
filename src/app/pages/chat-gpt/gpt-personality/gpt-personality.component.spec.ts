import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptPersonalityComponent } from './gpt-personality.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GptPersonalityFormGroup } from '../chat-gpt.component';

describe('GptPersonalityComponent', () => {
  let component: GptPersonalityComponent;
  let fixture: ComponentFixture<GptPersonalityComponent>;

  const formGroup = new FormGroup<GptPersonalityFormGroup>({
    streamersIdentity: new FormControl('', { nonNullable: true }),
    streamerModelRelation: new FormControl('', { nonNullable: true }),
    streamersThoughtsOnModel: new FormControl('', { nonNullable: true }),
    modelsIdentity: new FormControl('', { nonNullable: true }),
    modelsCoreIdentity: new FormControl('', { nonNullable: true }),
    modelsBackground: new FormControl('', { nonNullable: true }),
  });

  beforeEach(() => {
    TestBed.overrideComponent(GptPersonalityComponent, {
      set: {
        imports: [CommonModule, ReactiveFormsModule],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(GptPersonalityComponent);
    component = fixture.componentInstance;

    component.formGroup = formGroup;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
