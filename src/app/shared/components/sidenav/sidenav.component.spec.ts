import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavComponent } from './sidenav.component';
import { TwitchService } from '../../services/twitch.service';
import { VTubeStudioService } from '../../services/vtubestudio.service';
import { VStreamService } from '../../services/vstream.service';
import { AsyncPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  let twitchServiceStub: jasmine.SpyObj<TwitchService>;
  let vtubeStudioServiceStub: jasmine.SpyObj<VTubeStudioService>;
  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    twitchServiceStub = jasmine.createSpyObj('TwitchService', ['']);
    vtubeStudioServiceStub = jasmine.createSpyObj('VTubeStudioService', ['']);
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(SidenavComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: TwitchService, useValue: twitchServiceStub },
          { provide: VTubeStudioService, useValue: vtubeStudioServiceStub },
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
