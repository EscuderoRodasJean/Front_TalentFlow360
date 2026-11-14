import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PublicHeader } from '../../shared/ui/public-header';
import { CompanyCarousel } from '../companies/company-carousel';
import { Footer } from '../../shared/ui/footer';
import { Icon } from '../../shared/ui/icon';
import { CategoryLinks } from '../../shared/ui/category-links';
import { OpportunitySearch, OpportunityQuery } from '../../shared/forms/opportunity-search';
@Component({
  imports: [
    RouterLink,
    PublicHeader,
    CompanyCarousel,
    Footer,
    Icon,
    CategoryLinks,
    OpportunitySearch,
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class Welcome {
  private readonly router = inject(Router);
  search(q: OpportunityQuery) {
    void this.router.navigate(['/app/vacantes'], {
      queryParams: { q: q.query, ubicacion: q.location },
    });
  }
}
