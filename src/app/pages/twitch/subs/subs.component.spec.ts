import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsComponent } from './subs.component';

describe('SubsComponent', () => {
  let component: SubsComponent;
  let fixture: ComponentFixture<SubsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
