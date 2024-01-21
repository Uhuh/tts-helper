import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextCommandComponent } from './text-command.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TextCommandComponent', () => {
  let component: TextCommandComponent;
  let fixture: ComponentFixture<TextCommandComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(TextCommandComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(TextCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
