import { Component, inject } from '@angular/core';
import { ConfigService } from 'src/app/shared/services/config.service';
import voices from '../../../shared/json/streamlabs.json';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TtsSelectorComponent } from '../../../shared/components/tts-selector/tts-selector.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-streamlabs',
  templateUrl: './streamlabs.component.html',
  styleUrls: ['./streamlabs.component.scss'],
  imports: [TtsSelectorComponent],
})
export class StreamlabsComponent {
  private readonly configService = inject(ConfigService);
  readonly voices = voices;
  readonly streamlabsGroup = new FormGroup({
    voice: new FormControl('', { nonNullable: true }),
    language: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.configService.streamlabs$
      .pipe(takeUntilDestroyed())
      .subscribe((streamlabs) => {
        this.streamlabsGroup.setValue(streamlabs, {
          emitEvent: false,
        });
      });

    this.streamlabsGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((streamlabs) =>
        this.configService.updateStreamlabs(streamlabs),
      );
  }
}
