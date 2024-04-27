import { Component } from '@angular/core';
import { SubsComponent } from './subs/subs.component';
import { BitsComponent } from './bits/bits.component';
import { RedeemsComponent } from './redeems/redeems.component';
import { AuthComponent } from './auth/auth.component';
import { SettingsComponent } from './settings/settings.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FollowersComponent } from './followers/followers.component';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss'],
  standalone: true,
  imports: [AuthComponent, RedeemsComponent, BitsComponent, SubsComponent, SettingsComponent, MatTabsModule, FollowersComponent],
})
export class TwitchComponent {}

export default TwitchComponent;