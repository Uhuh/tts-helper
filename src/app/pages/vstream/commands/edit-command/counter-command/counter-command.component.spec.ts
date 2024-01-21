import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterCommandComponent } from './counter-command.component';
import { VStreamService } from '../../../../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CounterCommandComponent', () => {
  let component: CounterCommandComponent;
  let fixture: ComponentFixture<CounterCommandComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(CounterCommandComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(CounterCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
