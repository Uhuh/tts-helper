import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElevenLabsComponent } from './eleven-labs.component';

describe('ElevenLabsComponent', () => {
  let component: ElevenLabsComponent;
  let fixture: ComponentFixture<ElevenLabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElevenLabsComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ElevenLabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
