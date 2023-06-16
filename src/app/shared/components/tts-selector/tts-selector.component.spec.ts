import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsSelectorComponent } from './tts-selector.component';

describe('TtsSelectorComponent', () => {
  let component: TtsSelectorComponent;
  let fixture: ComponentFixture<TtsSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TtsSelectorComponent]
    });
    fixture = TestBed.createComponent(TtsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
