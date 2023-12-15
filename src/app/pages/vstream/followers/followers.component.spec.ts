import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersComponent } from './followers.component';

describe('FollowersComponent', () => {
  let component: FollowersComponent;
  let fixture: ComponentFixture<FollowersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
