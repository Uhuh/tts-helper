import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component'),
  },
  {
    path: 'twitch',
    loadComponent: () => import('./pages/twitch/twitch.component'),
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.component'),
  },
  {
    path: 'moderation',
    loadComponent: () => import('./pages/moderation/moderation.component'),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component'),
  },
  {
    path: 'chat-gpt',
    loadComponent: () => import('./pages/chat-gpt/chat-gpt.component'),
  },
  {
    path: 'chat-settings',
    loadComponent: () => import('./pages/chat-settings/chat-settings.component'),
  },
  {
    path: 'logs',
    loadComponent: () => import('./pages/user-logs/user-logs.component')
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
export class AppRoutingModule {
}
