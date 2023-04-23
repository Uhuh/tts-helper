import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsMonsterComponent } from './tts-monster.component';

describe('TtsMonsterComponent', () => {
  let component: TtsMonsterComponent;
  let fixture: ComponentFixture<TtsMonsterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TtsMonsterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TtsMonsterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
