import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LogService } from '../../shared/services/logs.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { saveTextFile } from '../../shared/util/save-file';

@Component({
    selector: 'app-user-logs',
    imports: [CommonModule, ButtonComponent],
    templateUrl: './user-logs.component.html',
    styleUrls: ['./user-logs.component.scss'],
})
export class UserLogsComponent {
  readonly #logService = inject(LogService);
  readonly #snackbar = inject(MatSnackBar);
  readonly #destroyRef = inject(DestroyRef);
  readonly logs$ = this.#logService.logs$;

  downloadLog() {
    this.logs$.pipe(
      take(1),
      takeUntilDestroyed(this.#destroyRef),
    ).subscribe(async logs => {
      const saved = await saveTextFile(
        `tts-helper-detailed-log-` + Date.now() + '.json',
        'application/json',
        JSON.stringify({ logs }, null, 2),
        { name: 'JSON', extensions: ['json'] },
      );

      if (!saved) {
        return;
      }

      this.#snackbar.open('Successfully downloaded log.', 'Dismiss', {
        panelClass: 'notification-success',
      });
    });
  }

  deleteLogs() {
    this.#logService.deleteLogs();
  }
}

export default UserLogsComponent;