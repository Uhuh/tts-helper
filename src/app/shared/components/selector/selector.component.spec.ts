import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorComponent } from './selector.component';

describe('SelectorComponent', () => {
  let component: SelectorComponent;
  let fixture: ComponentFixture<SelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SelectorComponent]
    });
    fixture = TestBed.createComponent(SelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
