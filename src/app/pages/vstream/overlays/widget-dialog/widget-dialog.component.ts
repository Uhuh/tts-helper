import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { LabelBlockComponent } from '../../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../../shared/components/selector/selector.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { VStreamEventTypes, VStreamWidget } from '../../../../shared/state/vstream/vstream.feature';
import { VStreamService } from '../../../../shared/services/vstream.service';

@Component({
  selector: 'app-widget-dialog',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent, SelectorComponent, MatDialogContent, MatDialogTitle, MatDialogActions, ButtonComponent, InputComponent],
  templateUrl: './widget-dialog.component.html',
  styleUrl: './widget-dialog.component.scss',
})
export class WidgetDialogComponent {
  eventOptions: { value: VStreamEventTypes, displayName: string }[] = [
    { value: 'new_follower', displayName: 'Follower' },
    { value: 'uplifting_chat_sent', displayName: 'UpLift' },
    { value: 'subscriptions_gifted', displayName: 'Gift Sub' },
    { value: 'subscription_renewed', displayName: 'Sub' },
    { value: 'shower_received', displayName: 'Meteor Shower' },
  ];

  settings = new FormGroup({
    trigger: new FormControl<VStreamEventTypes>('new_follower', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    customMessage: new FormControl(''),
    fileURL: new FormControl<string | null>(null),
    soundPath: new FormControl<string | null>(null),
    width: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    height: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    yPosition: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    xPosition: new FormControl(300, { nonNullable: true, validators: [Validators.required] }),
    fadeInDuration: new FormControl(2, { nonNullable: true }),
    fadeOutDuration: new FormControl(2, { nonNullable: true }),
  });

  widgetId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<WidgetDialogComponent>,
    private readonly vstreamService: VStreamService,
    @Inject(MAT_DIALOG_DATA) public data: VStreamWidget,
  ) {
    if (data) {
      const { id, ...settings } = data;

      this.widgetId = id;

      this.settings.setValue(settings, { emitEvent: false });
    }
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement & EventTarget)?.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const fileURL = await this.toBase64(file);

    if (typeof fileURL !== 'string') {
      return;
    }

    this.settings.controls.fileURL.setValue(fileURL);
  }

  toBase64 = (file: File) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  saveWidget() {
    const rawData = this.settings.getRawValue();

    this.dialogRef.close({ id: this.widgetId, ...rawData });
  }
}
