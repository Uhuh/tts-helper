import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermsComponent } from './user-perms.component';

describe('UserPermsComponent', () => {
  let component: UserPermsComponent;
  let fixture: ComponentFixture<UserPermsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserPermsComponent]
    });
    fixture = TestBed.createComponent(UserPermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
