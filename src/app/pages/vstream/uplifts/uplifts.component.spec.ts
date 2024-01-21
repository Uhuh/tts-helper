import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpliftsComponent } from './uplifts.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { Subject } from 'rxjs';
import { VStreamCustomMessageState } from '../../../shared/state/vstream/vstream.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UpliftsComponent', () => {
  let component: UpliftsComponent;
  let fixture: ComponentFixture<UpliftsComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  let upliftSubject: Subject<VStreamCustomMessageState>;

  beforeEach(() => {
    upliftSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      upliftSettings$: upliftSubject,
    });

    TestBed.overrideComponent(UpliftsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(UpliftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
