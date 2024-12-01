import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { SelectorComponent } from '../../shared/components/selector/selector.component';
import azureTts from '../../shared/json/azure-stt.json';
import { AzureSttService } from '../../shared/services/azure-stt.service';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { DisplayLabelComponent } from '../../shared/components/display-label/display-label.component';

@Component({
  selector: 'app-azure-stt',
  imports: [CommonModule, LabelBlockComponent, InputComponent, SelectorComponent, ToggleComponent, ButtonComponent, DisplayLabelComponent],
  templateUrl: './azure-stt.component.html',
  styleUrls: ['./azure-stt.component.scss'],
})
export class AzureSttComponent {
  private readonly azureService = inject(AzureSttService);

  readonly regions = azureTts.regions;
  readonly languages = azureTts.languages;

  readonly azureSettings = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    subscriptionKey: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    region: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    language: new FormControl('', { nonNullable: true }),
    hotkey: new FormControl('', { nonNullable: true }),
    thirdPartyUrl: new FormControl('', { nonNullable: true }),
  });

  isSettingHotKey = false;
  hotkey = '';

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

  constructor() {
    this.azureSettings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => {
        this.azureService.updateAzureState(settings);
      });

    this.azureService.state$
      .pipe(takeUntilDestroyed())
      .subscribe(state => {
        this.hotkey = state.hotkey ?? 'No hotkey set.';

        this.azureSettings.setValue(state, {
          emitEvent: false,
        });
      });
  }

  toggleHotkey() {
    this.isSettingHotKey = !this.isSettingHotKey;

    if (this.isSettingHotKey) {
      return;
    }

    this.azureService.updateGlobalHotKey(this.hotkey);
  }

  clearHotKey() {
    this.azureService.clearGlobalHotKoy(this.hotkey);
  }
}

export default AzureSttComponent;
