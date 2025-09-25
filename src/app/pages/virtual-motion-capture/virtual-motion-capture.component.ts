import { Component, computed, effect, inject } from '@angular/core';
import { InputComponent } from "../../shared/components/input/input.component";
import { LabelBlockComponent } from "../../shared/components/input-block/label-block.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { VirtualMotionCaptureProtocolService } from "../../shared/services/virtual-motion-capture-protocol.service";
import { ButtonComponent } from "../../shared/components/button/button.component";
import { debounceTime } from "rxjs";
import { MatSlider, MatSliderThumb } from "@angular/material/slider";
import { ToggleComponent } from "../../shared/components/toggle/toggle.component";

@Component({
  selector: 'app-virtual-motion-capture',
  imports: [
    InputComponent,
    LabelBlockComponent,
    ButtonComponent,
    FormsModule,
    MatSlider,
    MatSliderThumb,
    ReactiveFormsModule,
    ToggleComponent,
  ],
  templateUrl: './virtual-motion-capture.component.html',
  styleUrl: './virtual-motion-capture.component.scss',
})
export class VirtualMotionCaptureComponent {
  readonly #vmcService = inject(VirtualMotionCaptureProtocolService);
  readonly send_vnyan_params = this.#vmcService.store.send_vnyan_params;
  readonly paramTypeDisplay = computed(() => {
    return this.#vmcService.store.send_vnyan_params() ? 'VNyan param' : 'Blendshape';
  });
  readonly settings = new FormGroup({
    host: new FormControl('127.0.0.1', { nonNullable: true }),
    port: new FormControl(39539, { nonNullable: true }),
    blendshape_modifier: new FormControl(100, { nonNullable: true }),
    mouth_a_param: new FormControl('A', { nonNullable: true }),
    mouth_e_param: new FormControl('E', { nonNullable: true }),
    send_vnyan_params: new FormControl(false, { nonNullable: true }),
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
      const state = this.#vmcService.store.wholeState();

      this.settings.patchValue({ ...state }, { emitEvent: false });
    });
  }

  testConnection() {
    this.#vmcService.testConnection();
  }
}

export default VirtualMotionCaptureComponent;