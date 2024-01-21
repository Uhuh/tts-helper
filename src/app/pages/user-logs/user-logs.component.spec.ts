import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLogsComponent } from './user-logs.component';
import { LogService } from '../../shared/services/logs.service';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserLogsComponent', () => {
  let component: UserLogsComponent;
  let fixture: ComponentFixture<UserLogsComponent>;

  let logServiceStub: jasmine.SpyObj<LogService>;

  beforeEach(() => {
    logServiceStub = jasmine.createSpyObj('LogService', ['']);

    TestBed.overrideComponent(UserLogsComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: LogService, useValue: logServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(UserLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
