import { Component, inject } from '@angular/core';
import { InputComponent } from "../../shared/components/input/input.component";
import { LabelBlockComponent } from "../../shared/components/input-block/label-block.component";
import { FormControl, FormGroup } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { VirtualMotionCaptureService } from "../../shared/services/virtual-motion-capture.service";
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
  readonly #vmcService = inject(VirtualMotionCaptureService);
  readonly settings = new FormGroup({
    host: new FormControl('127.0.0.1', { nonNullable: true }),
    port: new FormControl(39539, { nonNullable: true }),
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
  }

  testConnection() {
    this.#vmcService.testConnection();
  }
}

export default VirtualMotionCaptureComponent;