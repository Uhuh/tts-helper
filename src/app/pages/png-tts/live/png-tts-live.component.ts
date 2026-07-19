import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { PngTtsService } from '../png-tts.service';

@Component({
  selector: 'app-png-tts-live',
  imports: [
    RouterLink,
    ButtonComponent,
    LabelBlockComponent,
  ],
  templateUrl: './png-tts-live.component.html',
  styleUrl: './png-tts-live.component.scss',
})
export class PngTtsLiveComponent {
  protected readonly service = inject(PngTtsService);

  readonly buttonCount = computed(() =>
    Math.max(this.service.models().length, this.service.reportedCount() ?? 0),
  );

  readonly buttonIndices = computed(() =>
    Array.from({ length: this.buttonCount() }, (_, i) => i),
  );

  modelLabel(index: number): string {
    const reported = this.service.reportedNames()[index];
    if (reported) {
      return reported;
    }

    const configured = this.service.models()[index];
    if (configured?.name) {
      return configured.name;
    }

    return `Model ${index + 1}`;
  }
}

export default PngTtsLiveComponent;
