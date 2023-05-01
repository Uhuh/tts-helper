import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftVariablesComponent } from './gift-variables.component';

describe('GiftVariablesComponent', () => {
  let component: GiftVariablesComponent;
  let fixture: ComponentFixture<GiftVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GiftVariablesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GiftVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
