import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },
  {
    path: 'heroes',
    loadComponent: () => import('./components/hero-list/hero-list.component').then(m => m.HeroListComponent)
  },
  {
    path: 'heroes/new',
    loadComponent: () => import('./components/hero-list/hero-list.component').then(m => m.HeroListComponent)
  },
  {
    path: 'heroes/edit/:heroId',
    loadComponent: () => import('./components/hero-list/hero-list.component').then(m => m.HeroListComponent)
  },
  {
    path: '**',
    redirectTo: '/heroes'
  }
];
