import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteorShowerComponent } from './meteor-shower.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { Subject } from 'rxjs';
import { VStreamCustomMessageState } from '../../../shared/state/vstream/vstream.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MeteorShowerComponent', () => {
  let component: MeteorShowerComponent;
  let fixture: ComponentFixture<MeteorShowerComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  let meteorshowerSubject: Subject<VStreamCustomMessageState>;

  beforeEach(() => {
    meteorshowerSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      meteorShowerSettings$: meteorshowerSubject,
    });

    TestBed.overrideComponent(MeteorShowerComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(MeteorShowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
