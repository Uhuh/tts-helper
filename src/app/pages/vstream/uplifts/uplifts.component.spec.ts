import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpliftsComponent } from './uplifts.component';

describe('UpliftsComponent', () => {
  let component: UpliftsComponent;
  let fixture: ComponentFixture<UpliftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpliftsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpliftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
