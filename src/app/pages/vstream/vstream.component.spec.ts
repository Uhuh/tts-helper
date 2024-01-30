import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VstreamComponent } from './vstream.component';
import { VStreamService } from '../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('VstreamComponent', () => {
  let component: VstreamComponent;
  let fixture: ComponentFixture<VstreamComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(VstreamComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(VstreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
