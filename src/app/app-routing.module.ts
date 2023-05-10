import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'twitch',
    loadComponent: () =>
      import('./pages/twitch/twitch.component').then((m) => m.TwitchComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.component').then(
        (m) => m.HistoryComponent
      ),
  },
  {
    path: 'moderation',
    loadComponent: () =>
      import('./pages/moderation/moderation.component').then(
        (m) => m.ModerationComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
