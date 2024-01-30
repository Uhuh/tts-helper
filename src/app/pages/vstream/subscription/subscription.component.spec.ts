import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionComponent } from './subscription.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { Subject } from 'rxjs';
import { VStreamSubscriptionSettingsState } from '../../../shared/state/vstream/vstream.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SubscriptionComponent', () => {
  let component: SubscriptionComponent;
  let fixture: ComponentFixture<SubscriptionComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  let subscriptionSubject: Subject<VStreamSubscriptionSettingsState>;

  beforeEach(() => {
    subscriptionSubject = new Subject();

    vstreamServiceStub = jasmine.createSpyObj('VStreamService', [''], {
      subscriptionSettings$: subscriptionSubject,
    });

    TestBed.overrideComponent(SubscriptionComponent, {
      set: {
        imports: [],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(SubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
