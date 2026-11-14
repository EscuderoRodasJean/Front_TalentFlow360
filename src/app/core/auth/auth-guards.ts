import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';
import { Rol } from '../api/models';
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthStore).valid() ||
  inject(Router).createUrlTree(['/ingresar'], { queryParams: { returnUrl: state.url } });
export const roleGuard: CanActivateChildFn = (route, state) => {
  const auth = inject(AuthStore),
    router = inject(Router),
    roles = route.data['roles'] as Rol[] | undefined;
  if (!auth.valid())
    return router.createUrlTree(['/ingresar'], { queryParams: { returnUrl: state.url } });
  return !roles || auth.has(roles) || router.createUrlTree(['/sin-acceso']);
};
export function safeReturnUrl(value: string | null): string {
  return value?.startsWith('/app/') && !value.includes('://') ? value : '/app/inicio';
}
