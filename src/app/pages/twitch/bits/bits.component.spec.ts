import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitsComponent } from './bits.component';

describe('BitsComponent', () => {
  let component: BitsComponent;
  let fixture: ComponentFixture<BitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BitsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
