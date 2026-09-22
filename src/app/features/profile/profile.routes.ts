import { Routes } from '@angular/router';
import { authGuard } from '../auth/services/auth.guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/profile-page.component').then(m => m.ProfilePageComponent),
    canActivate: [authGuard]
  }
];
