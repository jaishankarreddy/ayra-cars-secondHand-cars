import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  return auth.validateSession().pipe(
    map((ok) => (ok ? true : router.createUrlTree(['/admin/login'])))
  );
};
