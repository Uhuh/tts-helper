import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditWidgetComponent } from './edit-widget/edit-widget.component';
import { map, scan, take } from 'rxjs';
import { generateBrowserSource } from './utils/generateBrowserSource';
import { VStreamPubSubService } from '../../../shared/services/vstream-pubsub.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-overlays',
    imports: [CommonModule, ButtonComponent, LabelBlockComponent, EditWidgetComponent],
    templateUrl: './overlays.component.html',
    styleUrl: './overlays.component.scss'
})
export class OverlaysComponent {
  private readonly vstreamService = inject(VStreamService);
  private readonly vstreamPubsub = inject(VStreamPubSubService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly widgets$ = this.vstreamService.widgets$;

  createWidget() {
    this.vstreamService.createWidget();
  }

  test() {
    this.vstreamPubsub.testOverlays();
  }

  /**
   * Let users preview their changes so they don't have to download the browser source over and over to test.
   */
  preview() {
    this.widgets$
      .pipe(
        take(1),
        map((widgets) => {
          const htmlContent = generateBrowserSource(widgets);
          const blob = new Blob([htmlContent], { type: 'text/html' });

          return URL.createObjectURL(blob);
        }),
        scan((oldURL, newURL) => {
          URL.revokeObjectURL(oldURL);
          return newURL;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(url => window.open(url));
  }

  downloadBrowserSource() {
    this.widgets$
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(widgets => {
        const data = 'data:text/html;charset=utf-8,' + encodeURIComponent(generateBrowserSource(widgets));

        const anchor = document.createElement('a');
        anchor.download = `tts-helper-vstream-overlays.html`;
        anchor.href = data;
        anchor.click();

        this.snackbar.open('Successfully downloaded VStream overlays.', 'Dismiss', {
          panelClass: 'notification-success',
        });
      });
  }
}
