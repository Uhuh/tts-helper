import { ApplicationRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelBlockComponent } from '../../../shared/components/input-block/label-block.component';
import { ConnectionType } from '../../twitch/auth/auth.component';
import { VStreamService } from '../../../shared/services/vstream.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, LabelBlockComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  connectionStatus = signal<ConnectionType>('Disconnected');
  connectionMessage = signal('');
  isTokenValid = signal(false);
  loginUrl = '';

  constructor(
    private readonly vStreamService: VStreamService,
    private readonly ref: ApplicationRef,
  ) {
    /**
     * Each time a user wants to auth we need to do PKCE auth generation.
     * Hence the get method here.
     */
    this.vStreamService.getLoginURL()
      .subscribe(url => this.loginUrl = url);
  }

  signOut() {
    this.ref.tick();
  }
}
