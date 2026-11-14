import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { COMPANIES } from './company-catalog';
import { CompanyLogo } from './company-logo';
import { CompanyVacancies } from './company-vacancies';
import { PublicHeader } from '../../shared/ui/public-header';
import { Footer } from '../../shared/ui/footer';
import { Icon } from '../../shared/ui/icon';
import { Status } from '../../shared/ui/status';
@Component({
  imports: [RouterLink, CompanyLogo, PublicHeader, Footer, Icon, Status],
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.scss',
})
export class CompanyDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly company = computed(() => COMPANIES.find((c) => c.slug === this.params().get('slug')));
  readonly vacancies = inject(CompanyVacancies);
}
