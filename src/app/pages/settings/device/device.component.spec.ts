import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceComponent } from './device.component';
import { ConfigService } from '../../../shared/services/config.service';
import { PlaybackService } from '../../../shared/services/playback.service';
import { Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DeviceComponent', () => {
  let component: DeviceComponent;
  let fixture: ComponentFixture<DeviceComponent>;

  let configServiceStub: jasmine.SpyObj<ConfigService>;
  let playbackServiceStub: jasmine.SpyObj<PlaybackService>;

  let deviceSubject: Subject<string>;
  let volumeSubject: Subject<number>;
  let audioDelaySubject: Subject<number>;

  beforeEach(() => {
    deviceSubject = new Subject();
    volumeSubject = new Subject();
    audioDelaySubject = new Subject();

    configServiceStub = jasmine.createSpyObj('ConfigService', [''], {
      selectedDevice$: deviceSubject,
      deviceVolume$: volumeSubject,
      audioDelay$: audioDelaySubject,
    });

    playbackServiceStub = jasmine.createSpyObj('PlaybackService', ['listOutputDevices']);
    playbackServiceStub.listOutputDevices.and.returnValue(Promise.resolve({ outputDevices: [] }));

    TestBed.overrideComponent(DeviceComponent, {
      set: {
        imports: [],
        providers: [
          { provide: ConfigService, useValue: configServiceStub },
          { provide: PlaybackService, useValue: playbackServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(DeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
