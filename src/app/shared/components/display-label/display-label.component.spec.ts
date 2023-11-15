import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayLabelComponent } from './display-label.component';

describe('DisplayLabelComponent', () => {
  let component: DisplayLabelComponent;
  let fixture: ComponentFixture<DisplayLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayLabelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisplayLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
