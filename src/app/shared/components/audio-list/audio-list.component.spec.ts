import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioListComponent } from './audio-list.component';
import { AudioService } from '../../services/audio.service';
import { Subject } from 'rxjs';
import { AudioItem } from '../../state/audio/audio.feature';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AsyncPipe } from '@angular/common';

describe('AudioListComponent', () => {
  let component: AudioListComponent;
  let fixture: ComponentFixture<AudioListComponent>;

  let audioServiceStub: jasmine.SpyObj<AudioService>;

  let audioItemsSubject: Subject<AudioItem[]>;

  beforeEach(() => {
    audioItemsSubject = new Subject();

    audioServiceStub = jasmine.createSpyObj('AudioService', [''], {
      audioItems$: audioItemsSubject,
    });

    TestBed.overrideComponent(AudioListComponent, {
      set: {
        imports: [AsyncPipe],
        providers: [
          { provide: AudioService, useValue: audioServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(AudioListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
