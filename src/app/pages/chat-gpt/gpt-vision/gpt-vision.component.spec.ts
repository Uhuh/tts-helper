import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GptVisionComponent } from './gpt-vision.component';

describe('GptVisionComponent', () => {
  let component: GptVisionComponent;
  let fixture: ComponentFixture<GptVisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GptVisionComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(GptVisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
