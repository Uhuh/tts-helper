import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitchComponent } from './twitch.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TwitchComponent', () => {
  let component: TwitchComponent;
  let fixture: ComponentFixture<TwitchComponent>;

  beforeEach(() => {
    TestBed.overrideComponent(TwitchComponent, {
      set: {
        imports: [],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(TwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
