import { Component, HostListener, inject } from '@angular/core';
import { OpenAIService } from '../../../shared/services/openai.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Option, SelectorComponent } from '../../../shared/components/selector/selector.component';
import { map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DisplayLabelComponent } from '../../../shared/components/display-label/display-label.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-gpt-vision',
    imports: [
        LabelBlockComponent,
        InputComponent,
        ReactiveFormsModule,
        SelectorComponent,
        AsyncPipe,
        ButtonComponent,
        DisplayLabelComponent,
    ],
    templateUrl: './gpt-vision.component.html',
    styleUrl: './gpt-vision.component.scss'
})
export class GptVisionComponent {
  private readonly openaiService = inject(OpenAIService);

  readonly viewingDevices$ = this.openaiService.viewingDevices$
    .pipe(
      map(devices => devices
        .filter(d => !!d.id)
        .map<Option<string>>(d => ({
          value: d.id,
          displayName: d.name,
        }))),
    );

  readonly settings = new FormGroup({
    viewingDevice: new FormControl('', { nonNullable: true }),
    potentialPrompts: new FormControl('', { nonNullable: true }),
    globalHotkey: new FormControl('', { nonNullable: true }),
  });

  isSettingHotKey = false;
  hotkey = '';
  currentHotkey = '';
  imageError = false;

  constructor() {
    this.openaiService.vision$
      .pipe(takeUntilDestroyed())
      .subscribe(vision => {
        if (!this.isSettingHotKey) {
          this.hotkey = vision.globalHotkey ?? 'No hotkey set.';
          this.currentHotkey = vision.globalHotkey;
        }

        this.settings.setValue({
          viewingDevice: vision.viewingDevice,
          globalHotkey: vision.globalHotkey,
          potentialPrompts: vision.potentialPrompts.join(','),
        }, { emitEvent: false });
      });

    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.openaiService.updateVisionSettings({
        ...settings,
        potentialPrompts: settings.potentialPrompts?.split(','),
      }));
  }

  @HostListener('window:keydown', ['$event'])
  hotkeyBinding(event: KeyboardEvent) {
    if (!this.isSettingHotKey) {
      return;
    }

    const modifiers = [];

    if (event.ctrlKey) {
      modifiers.push('Control');
    }

    if (event.shiftKey) {
      modifiers.push('Shift');
    }

    if (event.altKey) {
      modifiers.push('Alt');
    }

    const key = modifiers.includes(event.key) ? '' : event.key;

    this.hotkey = (modifiers.length ? modifiers.join('+') + '+' : '') + key;
  }

  toggleHotkey() {
    this.isSettingHotKey = !this.isSettingHotKey;

    if (this.isSettingHotKey) {
      return;
    }

    this.openaiService.clearGlobalHotKoy(this.currentHotkey);
    this.openaiService.updateGlobalHotKey(this.hotkey);
  }

  clearHotKey() {
    this.openaiService.clearGlobalHotKoy(this.hotkey);
  }

  refreshList() {
    this.openaiService.getViewingDevices();
  }

  async captureScreen() {
    const b64 = await this.openaiService.testMonitorCapture(this.settings.controls.viewingDevice.value);
    this.imageError = !b64;

    const img = document.getElementById('screenshot') as HTMLImageElement;
    const dataB64 = `data:image/png;base64, ${b64}`;

    img.src = dataB64;
    img.style.display = 'block';
  }
}
