import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TtsRouterComponent } from './tts-router.component';

describe('TtsRouterComponent', () => {
  let component: TtsRouterComponent;
  let fixture: ComponentFixture<TtsRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TtsRouterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TtsRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
