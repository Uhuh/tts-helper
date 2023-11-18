import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VtubestudioComponent } from './vtubestudio.component';

describe('VtubestudioComponent', () => {
  let component: VtubestudioComponent;
  let fixture: ComponentFixture<VtubestudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VtubestudioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VtubestudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
