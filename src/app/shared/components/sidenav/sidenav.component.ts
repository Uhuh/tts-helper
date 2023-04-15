import { Component } from '@angular/core';

export interface SideNavLink {
  name: string;
  url: string;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  links: SideNavLink[] = [
    {
      name: 'Home',
      url: 'home',
    },
    {
      name: 'History',
      url: 'history',
    },
    {
      name: 'Twitch',
      url: 'twitch',
    },
    {
      name: 'Youtube',
      url: 'youtube',
    },
  ];
}
