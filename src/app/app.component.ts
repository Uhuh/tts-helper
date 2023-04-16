import { Component } from '@angular/core';
import { TwitchPubSub } from "./shared/services/twitch-pubsub";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  /**
   * @TODO - Figure out a better way to have the service come alive that isn't
   * just injecting it into the root of the app.
   */
  constructor(private readonly twitchPubSub: TwitchPubSub) {}
}
