import { Component } from '@angular/core';
import { ConfigService } from 'src/app/shared/services/config.service';
import voices from '../../../shared/json/stream-elements.json';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stream-elements',
  templateUrl: './stream-elements.component.html',
  styleUrls: ['./stream-elements.component.scss'],
  standalone: true,
  imports: [TtsSelectorComponent],
})
export class StreamElementsComponent {
  readonly voices = voices;
  streamElementsGroup = new FormGroup({
    voice: new FormControl('', { nonNullable: true }),
    language: new FormControl('', { nonNullable: true }),
  });

  constructor(private readonly configService: ConfigService) {
    this.configService.streamElements$
      .pipe(takeUntilDestroyed())
      .subscribe((streamElements) => {
        this.streamElementsGroup.setValue(streamElements, {
          emitEvent: false,
        });
      });

    this.streamElementsGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((streamElements) =>
        this.configService.updateStreamElements(streamElements)
      );
  }
}
