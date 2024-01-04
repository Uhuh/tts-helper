import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditWidgetComponent } from './edit-widget/edit-widget.component';
import { map, scan, take } from 'rxjs';
import { generateBrowserSource } from './utils/generateBrowserSource';
import { VStreamPubSubService } from '../../../shared/services/vstream-pubsub.service';

@Component({
  selector: 'app-overlays',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LabelBlockComponent, EditWidgetComponent],
  templateUrl: './overlays.component.html',
  styleUrl: './overlays.component.scss',
})
export class OverlaysComponent {
  widgets$ = this.vstreamService.widgets$;

  constructor(
    private readonly vstreamService: VStreamService,
    private readonly vstreamPubsub: VStreamPubSubService,
    private readonly snackbar: MatSnackBar,
  ) {}

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
      )
      .subscribe(url => window.open(url));
  }

  downloadBrowserSource() {
    this.widgets$
      .pipe(take(1))
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
