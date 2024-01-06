import { Component, inject } from '@angular/core';
import { ConfigService } from '../../../shared/services/config.service';
import voices from '../../../shared/json/amazon-polly.json';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input.component';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { SelectorComponent } from '../../../shared/components/selector/selector.component';

@Component({
  selector: 'app-amazon-polly',
  templateUrl: './amazon-polly.component.html',
  styleUrls: ['./amazon-polly.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatOptionModule,
    InputComponent,
    TtsSelectorComponent,
    LabelBlockComponent,
    SelectorComponent,
  ],
})
export class AmazonPollyComponent {
  private readonly configService = inject(ConfigService);
  readonly regions = voices.regions.map<{ value: string, displayName: string }>(r => ({ value: r, displayName: r }));
  readonly voices = voices.options;

  readonly amazonPollyGroup = new FormGroup({
    region: new FormControl(this.regions[0].value, { nonNullable: true }),
    poolId: new FormControl('', { nonNullable: true }),
    language: new FormControl('', { nonNullable: true }),
    voice: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.configService.amazonPolly$
      .pipe(takeUntilDestroyed())
      .subscribe((amazonPolly) => {
        this.amazonPollyGroup.setValue(amazonPolly, {
          emitEvent: false,
        });
      });

    this.amazonPollyGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((amazonPolly) =>
        this.configService.updateAmazonPolly(amazonPolly),
      );
  }
}
