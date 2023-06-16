import {
  Component,
  DestroyRef,
  Input,
  OnChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface TTSOption {
  value: string;
  displayName: string;
}

export interface Voices {
  language: string;
  options: TTSOption[];
}

@Component({
  selector: 'app-tts-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './tts-selector.component.html',
  styleUrls: ['./tts-selector.component.scss'],
})
export class TtsSelectorComponent implements OnChanges {
  @Input({ required: true }) languageControl!: FormControl<string>;
  @Input({ required: true }) voiceControl!: FormControl<string>;
  @Input({ required: true }) voices!: Voices[];

  languageVoiceMap = new Map<string, TTSOption[]>();
  languageVoiceOptions = signal<TTSOption[]>([]);
  languageOptions = signal<string[]>([]);

  private readonly destroyRef = inject(DestroyRef);

  ngOnChanges() {
    for (const voice of this.voices) {
      this.languageVoiceMap.set(voice.language, voice.options);
    }

    this.languageOptions.set([...this.languageVoiceMap.keys()]);

    this.languageVoiceOptions.set(
      this.languageVoiceMap.get(this.languageControl.value) ?? []
    );

    this.languageControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((language) => {
        this.languageVoiceOptions.set(
          this.languageVoiceMap.get(language) ?? []
        );

        this.voiceControl.patchValue(
          this.languageVoiceOptions()[0].value ?? ''
        );
      });
  }
}
