import { Component, inject } from '@angular/core';
import { LabelBlockComponent } from "../../shared/components/input-block/label-block.component";
import { ButtonComponent } from "../../shared/components/button/button.component";
import { TtsHelperApiService } from "../../shared/services/tts-helper-api.service";
import { EditOutboundSourceComponent } from "./edit-outbound-source/edit-outbound-source.component";

@Component({
  selector: 'app-api',
  imports: [
LabelBlockComponent,
ButtonComponent,
EditOutboundSourceComponent,
],
  templateUrl: './api.component.html',
  styleUrl: './api.component.scss',
})
export class ApiComponent {
  readonly #apiService = inject(TtsHelperApiService);
  readonly sources = this.#apiService.store.ai_response_sources;

  createOutboundSource() {
    this.#apiService.createSource();
  }
}

export default ApiComponent;