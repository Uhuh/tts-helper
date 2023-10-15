import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelBlockComponent } from './label-block.component';

describe('InputBlockComponent', () => {
  let component: LabelBlockComponent;
  let fixture: ComponentFixture<LabelBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LabelBlockComponent]
    });
    fixture = TestBed.createComponent(LabelBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
