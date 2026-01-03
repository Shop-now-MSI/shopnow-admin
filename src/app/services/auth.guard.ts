// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier directement le token dans le localStorage
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Pas de token, redirection vers login
    return router.createUrlTree(['/login']);
  }

  // Si token existe, vérifier sa validité avec le service
  return authService.isAuthenticated().pipe(
    take(1),
    map(isValid => {
      if (isValid) {
        return true;
      }
      // Token invalide, redirection vers login
      return router.createUrlTree(['/login']);
    })
  );
};
