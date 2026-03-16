import { Component, inject, input, OnChanges, SimpleChanges } from '@angular/core';
import { EmoteToExpression } from '../../../shared/state/vtubestudio/vtubestudio.feature.';
import { AccordionComponent } from '../../../shared/components/accordion/accordion.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VTubeStudioService } from '../../../shared/services/vtubestudio.service';

@Component({
  selector: 'app-emote-to-expression-accordion',
  imports: [
    AccordionComponent,
    ButtonComponent,
    InputComponent,
    LabelBlockComponent,
    ToggleComponent,
  ],
  templateUrl: './emote-to-expression-accordion.component.html',
  styleUrl: './emote-to-expression-accordion.component.scss',
})
export class EmoteToExpressionAccordionComponent implements OnChanges {
  private readonly vtubeStudioService = inject(VTubeStudioService);

  readonly emoteToExpression = input.required<EmoteToExpression>();

  readonly settings = new FormGroup({
    emotePattern: new FormControl('', { nonNullable: true }),
    expressionName: new FormControl('', { nonNullable: true }),
    isRegex: new FormControl(false, { nonNullable: true }),
    toggleDurationMs: new FormControl(0, { nonNullable: true }),
    shouldFilter: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(settings => this.vtubeStudioService.updateEmoteToExpression(this.emoteToExpression().id, settings));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['emoteToExpression']) {
      return;
    }

    const { emoteToExpression } = changes;
    const { id, ...settings } = emoteToExpression.currentValue;

    this.settings.setValue(settings, { emitEvent: false });
  }

  delete() {
    this.vtubeStudioService.deleteEmoteToExpression(this.emoteToExpression().id);
  }
}
