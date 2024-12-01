import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangelogDialogComponent } from './changelog-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {} from '@angular/common/http/testing';

describe('ChangelogDialogComponent', () => {
  let component: ChangelogDialogComponent;
  let fixture: ComponentFixture<ChangelogDialogComponent>;

  let matDialogRefStub: jasmine.SpyObj<MatDialogRef<ChangelogDialogComponent>>;

  beforeEach(() => {
    matDialogRefStub = jasmine.createSpyObj('MatDialogRef', ['']);

    TestBed.overrideComponent(ChangelogDialogComponent, {
      set: {
        imports: [HttpClientTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: matDialogRefStub },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ChangelogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
