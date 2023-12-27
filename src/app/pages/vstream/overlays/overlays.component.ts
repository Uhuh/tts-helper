import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { MatDialog } from '@angular/material/dialog';
import { WidgetDialogComponent } from './widget-dialog/widget-dialog.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { VStreamWidget } from '../../../shared/state/vstream/vstream.feature';

@Component({
  selector: 'app-overlays',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LabelBlockComponent],
  templateUrl: './overlays.component.html',
  styleUrl: './overlays.component.scss',
})
export class OverlaysComponent {
  widgets$ = this.vstreamService.widgets$;

  constructor(private readonly dialog: MatDialog, private readonly vstreamService: VStreamService) {}

  openDialog(widget?: VStreamWidget) {
    const dialogRef = this.dialog.open(WidgetDialogComponent, {
      data: widget,
      width: '350',
    });

    dialogRef.afterClosed().subscribe((widget: VStreamWidget | Omit<VStreamWidget, 'id'>) => {
      if ('id' in widget && widget.id) {
        this.vstreamService.updateWidget(widget);
      } else {
        this.vstreamService.createWidget(widget);
      }
    });
  }
}
