import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersComponent } from './followers.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { Subject } from 'rxjs';
import { VStreamCustomMessageState } from '../../../shared/state/vstream/vstream.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FollowersComponent', () => {
  let component: FollowersComponent;
  let fixture: ComponentFixture<FollowersComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  let followerSubject: Subject<VStreamCustomMessageState>;

  beforeEach(() => {
    followerSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      followerSettings$: followerSubject,
    });

    TestBed.overrideComponent(FollowersComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(FollowersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
