import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermsComponent } from './user-perms.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChatPermissionsFormGroup } from '../chat-settings.component';

describe('UserPermsComponent', () => {
  let component: UserPermsComponent;
  let fixture: ComponentFixture<UserPermsComponent>;

  const formGroup = new FormGroup<ChatPermissionsFormGroup>({
    allUsers: new FormControl(false, { nonNullable: true }),
    mods: new FormControl(false, { nonNullable: true }),
    payingMembers: new FormControl(false, { nonNullable: true }),
  });

  beforeEach(() => {
    TestBed.overrideComponent(UserPermsComponent, {
      set: {
        imports: [],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(UserPermsComponent);
    component = fixture.componentInstance;

    component.formGroup = formGroup;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
