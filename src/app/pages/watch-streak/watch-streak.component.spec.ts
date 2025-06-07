import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchStreakComponent } from './watch-streak.component';

describe('WatchStreakComponent', () => {
  let component: WatchStreakComponent;
  let fixture: ComponentFixture<WatchStreakComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchStreakComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchStreakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
