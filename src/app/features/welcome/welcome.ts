import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Brand } from '../../shared/ui/brand';
import { Footer } from '../../shared/ui/footer';
import { Icon } from '../../shared/ui/icon';
import { CategoryLinks } from '../../shared/ui/category-links';
import { OpportunitySearch, OpportunityQuery } from '../../shared/forms/opportunity-search';
@Component({
  imports: [RouterLink, Brand, Footer, Icon, CategoryLinks, OpportunitySearch],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome {
  private readonly router = inject(Router);
  readonly sectors = [
    { name: 'Tecnología', query: 'desarrollo', icon: 'code', initial: '{ }', color: 'violet' },
    { name: 'Finanzas', query: 'finanzas', icon: 'chart', initial: '↗', color: 'blue' },
    { name: 'Diseño', query: 'diseño', icon: 'spark', initial: '✦', color: 'pink' },
    { name: 'Operaciones', query: 'operaciones', icon: 'briefcase', initial: '◎', color: 'teal' },
    { name: 'Ingeniería', query: 'ingeniería', icon: 'layers', initial: '◇', color: 'amber' },
  ];
  search(q: OpportunityQuery) {
    void this.router.navigate(['/app/vacantes'], {
      queryParams: { q: q.query, ubicacion: q.location },
    });
  }
}
