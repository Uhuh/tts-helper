import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveQueueComponent } from './live-queue.component';

describe('LiveQueueComponent', () => {
  let component: LiveQueueComponent;
  let fixture: ComponentFixture<LiveQueueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LiveQueueComponent]
    });
    fixture = TestBed.createComponent(LiveQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
