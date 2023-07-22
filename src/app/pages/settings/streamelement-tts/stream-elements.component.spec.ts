import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamElementsComponent } from './stream-elements.component';

describe('StreamelementTtsComponent', () => {
  let component: StreamElementsComponent;
  let fixture: ComponentFixture<StreamElementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamElementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
