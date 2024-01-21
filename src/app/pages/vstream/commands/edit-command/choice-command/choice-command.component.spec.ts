import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceCommandComponent } from './choice-command.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ChoiceCommandComponent', () => {
  let component: ChoiceCommandComponent;
  let fixture: ComponentFixture<ChoiceCommandComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(ChoiceCommandComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ChoiceCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
