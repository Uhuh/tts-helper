import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth/auth.component';
import { SettingsComponent } from './settings/settings.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { UpliftsComponent } from './uplifts/uplifts.component';
import { MeteorShowerComponent } from './meteor-shower/meteor-shower.component';
import { FollowersComponent } from './followers/followers.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatCommandsComponent } from './chat-commands/chat-commands.component';

@Component({
  selector: 'app-vstream',
  standalone: true,
  imports: [CommonModule, AuthComponent, SettingsComponent, SubscriptionComponent, UpliftsComponent, MeteorShowerComponent, FollowersComponent, MatTabsModule, ChatCommandsComponent],
  templateUrl: './vstream.component.html',
  styleUrl: './vstream.component.scss',
})
export class VstreamComponent {
}

export default VstreamComponent;