import { Component, inject } from '@angular/core';
import { LabelBlockComponent } from '../../shared/components/input-block/label-block.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ToggleComponent } from '../../shared/components/toggle/toggle.component';
import { VTubeStudioService } from '../../shared/services/vtubestudio.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, take } from 'rxjs';

@Component({
  selector: 'app-vtubestudio',
  standalone: true,
  imports: [
    LabelBlockComponent,
    InputComponent,
    ToggleComponent,
  ],
  templateUrl: './vtubestudio.component.html',
  styleUrl: './vtubestudio.component.scss',
})
export class VtubestudioComponent {
  private readonly vtubeStudioService = inject(VTubeStudioService);
  readonly settings = new FormGroup({
    port: new FormControl(8001, { nonNullable: true }),
    isMirrorMouthFormEnabled: new FormControl(false, { nonNullable: true }),
    isMirrorMouthOpenEnabled: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    this.vtubeStudioService.state$
      .pipe(takeUntilDestroyed(), take(1))
      .subscribe(state => {
        this.settings.setValue(state, { emitEvent: false });
      });

    this.settings.valueChanges.pipe(takeUntilDestroyed(), debounceTime(200))
      .subscribe(settings => this.vtubeStudioService.updateState(settings));
  }
}

export default VtubestudioComponent;