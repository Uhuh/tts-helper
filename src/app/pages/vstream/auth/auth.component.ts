import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { ConnectionType } from '../../twitch/auth/auth.component';
import { VStreamService } from '../../../shared/services/vstream.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-auth',
    imports: [CommonModule, LabelBlockComponent],
    templateUrl: './auth.component.html',
    styleUrl: './auth.component.scss'
})
export class AuthComponent {
  private readonly vStreamService = inject(VStreamService);
  readonly connectionStatus = signal<ConnectionType>('Disconnected');
  readonly connectionMessage = signal('');
  readonly isTokenValid = signal(false);
  loginUrl = '';

  constructor() {
    this.vStreamService.token$
      .pipe(takeUntilDestroyed())
      .subscribe(token => {
        const now = Date.now();

        if (token.expireDate > now && token.accessToken) {
          this.connectionStatus.set('Connected');
          this.connectionMessage.set(
            `Your VStream account is currently connected with TTS Helper.`,
          );

          return this.isTokenValid.set(true);
        } else if (token.expireDate < now && token.accessToken) {
          this.connectionStatus.set('Expired');
          this.connectionMessage.set(
            `The login has expired, please sign in again to reconnect to VStream.`,
          );
        } else {
          this.connectionStatus.set('Disconnected');
          this.connectionMessage.set(
            `You've been disconnected. You'll need to sign-in again to reconnect your VStream account.`,
          );
        }

        this.isTokenValid.set(false);
      });

    /**
     * Each time a user wants to auth we need to do PKCE auth generation.
     * Hence the get method here.
     */
    this.vStreamService.getLoginURL()
      .pipe(takeUntilDestroyed())
      .subscribe(url => this.loginUrl = url);
  }

  signOut() {
    this.vStreamService.signOut();
  }
}
