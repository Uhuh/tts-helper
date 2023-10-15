import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioListComponent } from './audio-list.component';

describe('HistoryListComponent', () => {
  let component: AudioListComponent;
  let fixture: ComponentFixture<AudioListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
