import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioItemComponent } from './audio-item.component';

describe('HistoryItemComponent', () => {
  let component: AudioItemComponent;
  let fixture: ComponentFixture<AudioItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
