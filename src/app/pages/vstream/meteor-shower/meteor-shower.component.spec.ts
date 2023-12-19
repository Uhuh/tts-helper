import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteorShowerComponent } from './meteor-shower.component';

describe('MeteorShowerComponent', () => {
  let component: MeteorShowerComponent;
  let fixture: ComponentFixture<MeteorShowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeteorShowerComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeteorShowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
