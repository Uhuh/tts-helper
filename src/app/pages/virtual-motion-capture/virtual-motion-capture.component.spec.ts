import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualMotionCaptureComponent } from './virtual-motion-capture.component';

describe('VirtualMotionCaptureComponent', () => {
  let component: VirtualMotionCaptureComponent;
  let fixture: ComponentFixture<VirtualMotionCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualMotionCaptureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualMotionCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
