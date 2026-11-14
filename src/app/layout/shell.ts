import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore, MANAGERS, STAFF } from '../core/auth/auth-store';
import { Rol } from '../core/api/models';
import { Icon } from '../shared/ui/icon';
import { humanize } from '../shared/ui/status';
@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly auth = inject(AuthStore);
  readonly router = inject(Router);
  readonly open = signal(false);
  readonly label = humanize;
  readonly links: { path: string; label: string; icon: string; roles?: Rol[] }[] = [
    { path: 'inicio', label: 'Mi espacio', icon: 'grid' },
    { path: 'vacantes', label: 'Oportunidades', icon: 'briefcase' },
    { path: 'perfil', label: 'Mi perfil', icon: 'user', roles: ['POSTULANTE'] },
    { path: 'postulaciones', label: 'Postulaciones', icon: 'layers' },
    { path: 'entrevistas', label: 'Agenda de entrevistas', icon: 'calendar', roles: STAFF },
    { path: 'evaluaciones', label: 'Evaluaciones', icon: 'check', roles: STAFF },
    { path: 'indicadores', label: 'Indicadores', icon: 'chart', roles: MANAGERS },
    { path: 'usuarios', label: 'Equipo y accesos', icon: 'shield', roles: MANAGERS },
  ];
  logout() {
    this.auth.clear();
    void this.router.navigate(['/ingresar']);
  }
}
