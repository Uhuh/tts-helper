import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsComponent } from './tools.component';
import { TwitchService } from '../../shared/services/twitch.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ToolsComponent', () => {
  let component: ToolsComponent;
  let fixture: ComponentFixture<ToolsComponent>;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;

  beforeEach(() => {
    twitchServiceStub = jasmine.createSpyObj('TwitchService', ['']);

    TestBed.overrideComponent(ToolsComponent, {
      set: {
        imports: [],
        providers: [
          { provide: TwitchService, useValue: twitchServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(ToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
