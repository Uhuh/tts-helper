import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWidgetComponent } from './edit-widget.component';
import { VStreamService } from '../../../../shared/services/vstream.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VStreamWidget } from '../../../../shared/state/vstream/vstream.feature';
import { CdkAccordionModule } from '@angular/cdk/accordion';

describe('EditWidgetComponent', () => {
  let component: EditWidgetComponent;
  let fixture: ComponentFixture<EditWidgetComponent>;

  const widget: VStreamWidget = {
    id: 'my-cool-widget-id',
    enabled: true,
    fontColor: '#fff',
    fontSize: 32,
    soundPath: null,
    fadeOutDuration: 200,
    fadeInDuration: 200,
    duration: 2,
    customMessage: 'Thanks {username}',
    width: 300,
    height: 300,
    fontPosition: 'center',
    yPosition: 300,
    xPosition: 300,
    trigger: 'new_follower',
    fileURL: null,
  };

  let vstreamServiceStub: jasmine.SpyObj<VStreamService>;

  beforeEach(() => {
    vstreamServiceStub = jasmine.createSpyObj('VStreamService', ['']);

    TestBed.overrideComponent(EditWidgetComponent, {
      set: {
        imports: [CdkAccordionModule],
        providers: [
          { provide: VStreamService, useValue: vstreamServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    fixture = TestBed.createComponent(EditWidgetComponent);
    component = fixture.componentInstance;

    component.widget = widget;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
