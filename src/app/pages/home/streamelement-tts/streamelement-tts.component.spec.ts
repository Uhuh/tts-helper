import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamelementTtsComponent } from './streamelement-tts.component';

describe('StreamelementTtsComponent', () => {
  let component: StreamelementTtsComponent;
  let fixture: ComponentFixture<StreamelementTtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamelementTtsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamelementTtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
