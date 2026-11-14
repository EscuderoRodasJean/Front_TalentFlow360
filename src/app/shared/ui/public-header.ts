import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Brand } from './brand';
import { Icon } from './icon';
import { OpportunitySearch, OpportunityQuery } from '../forms/opportunity-search';
import { AuthStore } from '../../core/auth/auth-store';
@Component({
  selector: 'tf-public-header',
  imports: [RouterLink, Brand, Icon, OpportunitySearch],
  template: `<header class="public-header">
    <div class="header-main">
      <tf-brand />
      @if (compactSearch()) {
        <div class="header-search"><tf-opportunity-search (searched)="search($event)" /></div>
      }
      <nav aria-label="Acceso público">
        @if (auth.valid()) {
          <a routerLink="/app/inicio" class="btn primary">Ir a mi espacio</a>
        } @else {
          <a class="team-link" routerLink="/ingresar" [queryParams]="{ acceso: 'equipo' }"
            >Equipo de selección</a
          ><a class="create-link" routerLink="/registro">Crear cuenta</a
          ><a class="btn primary" routerLink="/ingresar">Ingresar</a>
        }
      </nav>
    </div>
    <div class="header-sub">
      <div>
        <a routerLink="/" fragment="como-funciona">Descubre TalentFlow <span>⌄</span></a
        ><i></i><a routerLink="/empresas"><tf-icon name="briefcase" />Buscar empresas</a>
      </div>
      <a routerLink="/" fragment="matching"><tf-icon name="spark" />Matching explicable</a>
    </div>
  </header>`,
  styleUrl: './public-header.scss',
})
export class PublicHeader {
  readonly compactSearch = input(false);
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  search(q: OpportunityQuery) {
    void this.router.navigate(['/app/vacantes'], {
      queryParams: { q: q.query, ubicacion: q.location },
    });
  }
}
