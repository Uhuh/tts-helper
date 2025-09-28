import { Component, inject, input, OnChanges } from '@angular/core';
import { ButtonComponent } from "../../../shared/components/button/button.component";
import { CdkAccordion, CdkAccordionItem } from "@angular/cdk/accordion";
import { LabelBlockComponent } from "../../../shared/components/input-block/label-block.component";
import { OutboundSource } from "../../../shared/state/api/tts-helper-api.feature";
import { MatIcon } from "@angular/material/icon";
import { TtsHelperApiService } from "../../../shared/services/tts-helper-api.service";
import { InputComponent } from "../../../shared/components/input/input.component";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-edit-outbound-source',
  imports: [
    ButtonComponent,
    CdkAccordion,
    CdkAccordionItem,
    LabelBlockComponent,
    MatIcon,
    InputComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-outbound-source.component.html',
  styleUrl: './edit-outbound-source.component.scss',
})
export class EditOutboundSourceComponent implements OnChanges {
  readonly #apiService = inject(TtsHelperApiService);
  readonly source = input.required<OutboundSource>();
  readonly settings = new FormGroup({
    uri: new FormControl('', { nonNullable: true }),
    body: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(partial => this.#apiService.updateSource(this.source().id, partial));
  }

  ngOnChanges() {
    const source = this.source();

    this.settings.patchValue(source, { emitEvent: false });
  }

  deleteSource() {
    this.#apiService.deleteSource(this.source().id);
  }
}
