import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-twitch',
  templateUrl: './twitch.component.html',
  styleUrls: ['./twitch.component.scss'],
})
export class TwitchComponent implements OnInit, OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  // Rust server running so we can auth in the users browser
  private readonly redirect = 'http://localhost:12583/auth/twitch';
  private readonly clientId = 'fprxp4ve0scf8xg6y48nwcq1iogxuq';
  private readonly scopes =
    'channel%3Aread%3Aredemptions+channel%3Aread%3Asubscriptions+chat%3Aread';
  readonly loginUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${this.redirect}&response_type=token&scope=${this.scopes}`;

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
