import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component'),
  },
  {
    path: 'twitch',
    loadComponent: () => import('./pages/twitch/twitch.component'),
  },
  {
    path: 'youtube',
    loadComponent: () => import('./pages/youtube/youtube.component'),
  },
  {
    path: 'virtual-motion-capture',
    loadComponent: () => import('./pages/virtual-motion-capture/virtual-motion-capture.component'),
  },
  {
    path: 'vtubestudio',
    loadComponent: () => import('./pages/vtubestudio/vtubestudio.component'),
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.component'),
  },
  {
    path: 'queue',
    loadComponent: () => import('./pages/live-queue/live-queue.component'),
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
    path: 'azure-settings',
    loadComponent: () => import('./pages/azure-stt/azure-stt.component'),
  },
  {
    path: 'logs',
    loadComponent: () => import('./pages/user-logs/user-logs.component'),
  },
  {
    path: 'tools',
    loadComponent: () => import('./pages/tools/tools.component'),
  },
  {
    path: 'app-settings',
    loadComponent: () => import('./pages/app-settings/app-settings.component'),
  },
  {
    path: 'tts-mapping',
    loadComponent: () => import('./pages/tts-mapping/tts-mapping.component'),
  },
  {
    path: 'multi-voices',
    loadComponent: () => import('./pages/multi-voices/multi-voices.component'),
  },
  {
    path: 'watch-streak',
    loadComponent: () => import('./pages/watch-streak/watch-streak.component'),
  },
  {
    path: 'api',
    loadComponent: () => import('./pages/api/api.component'),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];