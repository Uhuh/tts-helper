import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemsComponent } from './redeems.component';

describe('RedeemsComponent', () => {
  let component: RedeemsComponent;
  let fixture: ComponentFixture<RedeemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedeemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
