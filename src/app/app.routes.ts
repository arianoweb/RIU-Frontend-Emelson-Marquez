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
    path: 'hero-detail',
    loadComponent: () => import('./components/hero-detail/hero-detail.component').then(m => m.HeroDetailComponent)
  },
  {
    path: 'hero-detail/:id',
    loadComponent: () => import('./components/hero-detail/hero-detail.component').then(m => m.HeroDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/heroes'
  }
];
