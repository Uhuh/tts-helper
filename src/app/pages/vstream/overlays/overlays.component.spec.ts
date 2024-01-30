import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlaysComponent } from './overlays.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { VStreamPubSubService } from '../../../shared/services/vstream-pubsub.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';

describe('OverlaysComponent', () => {
  let component: OverlaysComponent;
  let fixture: ComponentFixture<OverlaysComponent>;

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;
  let vstreamPubsubServiceStub: jasmine.SpyObj<VStreamPubSubService>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);
    vstreamPubsubServiceStub = jasmine.createSpyObj('VStreamPubSubService', ['']);

    TestBed.overrideComponent(OverlaysComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
          { provide: VStreamPubSubService, useValue: vstreamPubsubServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(OverlaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
