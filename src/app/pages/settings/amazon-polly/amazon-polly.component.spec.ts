import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonPollyComponent } from './amazon-polly.component';
import { ConfigService } from '../../../shared/services/config.service';
import { Subject } from 'rxjs';
import { AmazonPollyData } from '../../../shared/state/config/config.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AmazonPollyComponent', () => {
  let component: AmazonPollyComponent;
  let fixture: ComponentFixture<AmazonPollyComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;

  let amazonpollySubject: Subject<AmazonPollyData>;

  beforeEach(() => {
    amazonpollySubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      amazonPolly$: amazonpollySubject,
    });

    TestBed.overrideComponent(AmazonPollyComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ConfigService, useValue: configServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(AmazonPollyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
