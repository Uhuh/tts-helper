import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LogService } from '../../shared/services/logs.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-logs',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './user-logs.component.html',
  styleUrls: ['./user-logs.component.scss'],
})
export class UserLogsComponent {
  logService = inject(LogService);
  snackbar = inject(MatSnackBar);
  logs$ = this.logService.logs$;

  downloadLog() {
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      logs: this.logs$.value
    }, undefined, 2));

    const anchor = document.createElement('a');
    anchor.download = `tts-helper-detailed-log-` + Date.now() + '.json';
    anchor.href = data;
    anchor.click();

    this.snackbar.open('Successfully downloaded log.', 'Dismiss', {
      panelClass: 'notification-success',
    });
  }

  deleteLogs() {
    this.logService.deleteLogs();
  }
}

export default UserLogsComponent;