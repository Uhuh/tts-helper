import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { LabelBlockComponent } from '../../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../../shared/components/selector/selector.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { VStreamEventTypes, VStreamWidget } from '../../../../shared/state/vstream/vstream.feature';
import { MatRadioModule } from '@angular/material/radio';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { VStreamService } from '../../../../shared/services/vstream.service';
import { VStreamEventVariables } from '../../utils/variables';
import { VariableTableComponent } from '../../../../shared/components/variable-table/variable-table.component';
import { ColorChromeModule } from 'ngx-color/chrome';
import { ColorEvent } from 'ngx-color';
import { RGBAString } from '../../../tools/captions/assets/captions';

@Component({
  selector: 'app-edit-widget',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, SelectorComponent, MatDialogContent, MatDialogTitle, MatDialogActions, ButtonComponent, InputComponent, MatRadioModule, ReactiveFormsModule, CdkAccordionModule, MatIconModule, MatTabsModule, VariableTableComponent, ColorChromeModule],
  templateUrl: './edit-widget.component.html',
  styleUrl: './edit-widget.component.scss',
})
export class EditWidgetComponent implements OnInit {
  @Input({ required: true }) widget!: VStreamWidget;

  eventOptions: { value: VStreamEventTypes, displayName: string }[] = [
    { value: 'new_follower', displayName: 'Follower' },
    { value: 'uplifting_chat_sent', displayName: 'UpLift' },
    { value: 'subscriptions_gifted', displayName: 'Gift Sub' },
    { value: 'subscription_renewed', displayName: 'Sub' },
    { value: 'shower_received', displayName: 'Meteor Shower' },
  ];

  fontPositions = ['top', 'left', 'bottom', 'right', 'center'];

  fontColor = '#fff';

  variables = VStreamEventVariables.new_follower;

  settings = new FormGroup({
    trigger: new FormControl<VStreamEventTypes>('new_follower', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    duration: new FormControl(5, { nonNullable: true, validators: [Validators.required] }),
    customMessage: new FormControl(''),
    fileURL: new FormControl<string | null>(null),
    soundPath: new FormControl<string | null>(null),
    width: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    height: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    yPosition: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    xPosition: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    fontPosition: new FormControl<string | null>(null),
    fontColor: new FormControl<string | null>(null),
    fontSize: new FormControl(20, { nonNullable: true }),
    fadeInDuration: new FormControl(300, { nonNullable: true }),
    fadeOutDuration: new FormControl(300, { nonNullable: true }),
  });

  constructor(private readonly vstreamService: VStreamService) {
    this.settings.controls.trigger.valueChanges
      .subscribe(trigger => {
        this.variables = VStreamEventVariables[trigger];
      });

    this.settings.valueChanges
      .subscribe(settings => {
        this.vstreamService.updateWidget({ id: this.widget.id, ...settings });
      });
  }

  ngOnInit() {
    const { id, ...settings } = this.widget;

    this.variables = VStreamEventVariables[settings.trigger];
    this.fontColor = settings.fontColor ?? this.fontColor;
    this.settings.setValue(settings, { emitEvent: false });
  }

  rgba(color: ColorEvent): RGBAString {
    const { r, b, g, a } = color.color.rgb;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  changeColor(event: ColorEvent) {
    const color = this.rgba(event);

    // For display purposes.
    this.fontColor = color;
    this.settings.controls.fontColor.setValue(color);
  }

  async onFileSelected(event: Event, type: 'image' | 'sound') {
    const file = (event.target as HTMLInputElement & EventTarget)?.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const fileURL = await this.toBase64(file);

    if (typeof fileURL !== 'string') {
      return;
    }

    switch (type) {
      case 'image':
        this.settings.controls.fileURL.setValue(fileURL);
        break;
      case 'sound':
        this.settings.controls.soundPath.setValue(fileURL);
        break;
    }
  }

  deleteWidget() {
    this.vstreamService.deleteWidget(this.widget.id);
  }

  toBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }
}
