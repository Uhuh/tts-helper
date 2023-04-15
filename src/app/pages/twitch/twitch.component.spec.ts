import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitchComponent } from './twitch.component';

describe('TwitchComponent', () => {
  let component: TwitchComponent;
  let fixture: ComponentFixture<TwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwitchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
