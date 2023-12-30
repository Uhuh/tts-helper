import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlaysComponent } from './overlays.component';

describe('OverlaysComponent', () => {
  let component: OverlaysComponent;
  let fixture: ComponentFixture<OverlaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlaysComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OverlaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
