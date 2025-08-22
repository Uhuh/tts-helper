import { Component, effect, inject } from '@angular/core';
import { InputComponent } from "../../shared/components/input/input.component";
import { LabelBlockComponent } from "../../shared/components/input-block/label-block.component";
import { FormControl, FormGroup } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { VirtualMotionCaptureProtocolService } from "../../shared/services/virtual-motion-capture-protocol.service";
import { ButtonComponent } from "../../shared/components/button/button.component";
import { debounceTime } from "rxjs";

@Component({
  selector: 'app-virtual-motion-capture',
  imports: [
    InputComponent,
    LabelBlockComponent,
    ButtonComponent,
  ],
  templateUrl: './virtual-motion-capture.component.html',
  styleUrl: './virtual-motion-capture.component.scss',
})
export class VirtualMotionCaptureComponent {
  readonly #vmcService = inject(VirtualMotionCaptureProtocolService);
  readonly settings = new FormGroup({
    host: new FormControl('127.0.0.1', { nonNullable: true }),
    port: new FormControl(39539, { nonNullable: true }),
    mouth_a_param: new FormControl('A', { nonNullable: true }),
    mouth_e_param: new FormControl('E', { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(200),
      )
      .subscribe(settings => {
        this.#vmcService.updateState(settings);
      });

    effect(() => {
      const { host, port, mouth_a_param, mouth_e_param } = this.#vmcService.store.wholeState();

      this.settings.patchValue({ host, port, mouth_a_param, mouth_e_param }, { emitEvent: false });
    });
  }

  testConnection() {
    this.#vmcService.testConnection();
  }
}

export default VirtualMotionCaptureComponent;