import { Component, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccordionComponent } from '../../../shared/components/accordion/accordion.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { Option, SelectorComponent } from '../../../shared/components/selector/selector.component';
import { PngTtsAnimation, PngTtsModel } from '../assets/png-tts-generator';

@Component({
  selector: 'app-png-tts-model-accordion',
  imports: [
    AccordionComponent,
    ButtonComponent,
    InputComponent,
    LabelBlockComponent,
    SelectorComponent,
  ],
  templateUrl: './png-tts-model-accordion.component.html',
  styleUrl: './png-tts-model-accordion.component.scss',
})
export class PngTtsModelAccordionComponent implements OnChanges {
  readonly index = input.required<number>();
  readonly model = input.required<PngTtsModel>();

  readonly update = output<PngTtsModel>();
  readonly remove = output<void>();
  readonly preview = output<PngTtsModel>();

  readonly animationOptions: Option<PngTtsAnimation>[] = [
    { displayName: 'None', value: 'none' },
    { displayName: 'Jump', value: 'jump' },
    { displayName: 'Shake', value: 'shake' },
    { displayName: 'Bounce', value: 'bounce' },
    { displayName: 'Sway', value: 'sway' },
  ];

  readonly settings = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    extension: new FormControl('png', { nonNullable: true }),
    talkAnimation: new FormControl<PngTtsAnimation>('none', { nonNullable: true }),
    intensity: new FormControl(100, { nonNullable: true }),
    duration: new FormControl(400, { nonNullable: true }),
    opacity: new FormControl(100, { nonNullable: true }),
    dimness: new FormControl(0, { nonNullable: true }),
  });

  constructor() {
    this.settings.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.update.emit(this.toModel()));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['model']) {
      return;
    }

    const next = this.toForm(this.model());

    // Skip reseeding when the incoming model is just the echo of our own edit.
    if (!this.matchesCurrent(next)) {
      this.settings.setValue(next, { emitEvent: false });
    }
  }

  cleanExtension(): string {
    return (this.settings.controls.extension.value || '')
      .replace(/^\./, '')
      .trim()
      .toLowerCase() || 'png';
  }

  previewModel() {
    this.preview.emit(this.toModel());
  }

  private toForm(model: PngTtsModel) {
    return {
      name: model.name,
      extension: model.extension,
      talkAnimation: model.talkAnimation,
      intensity: Math.round(model.intensity * 100),
      duration: model.duration,
      opacity: Math.round(model.opacity * 100),
      dimness: Math.round(model.dimness * 100),
    };
  }

  private matchesCurrent(next: ReturnType<PngTtsModelAccordionComponent['toForm']>): boolean {
    const current = this.settings.getRawValue();

    return current.name === next.name
      && current.extension === next.extension
      && current.talkAnimation === next.talkAnimation
      && current.intensity === next.intensity
      && current.duration === next.duration
      && current.opacity === next.opacity
      && current.dimness === next.dimness;
  }

  private toModel(): PngTtsModel {
    const value = this.settings.getRawValue();

    return {
      name: value.name,
      extension: value.extension,
      talkAnimation: value.talkAnimation,
      intensity: value.intensity / 100,
      duration: value.duration,
      opacity: value.opacity / 100,
      dimness: value.dimness / 100,
    };
  }
}
