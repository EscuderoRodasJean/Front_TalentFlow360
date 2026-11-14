import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { AuthStore, MANAGERS, STAFF } from '../../core/auth/auth-store';
import { TalentApi } from '../../core/api/talent-api';
import { PostulanteDTO, PostulacionDTO, VacanteDTO } from '../../core/api/models';
import { errorMessage } from '../../core/api/http-interceptors';
import { Icon } from '../../shared/ui/icon';
import { AsyncState } from '../../shared/ui/async-state';
import { CategoryLinks } from '../../shared/ui/category-links';
import { OpportunitySearch, OpportunityQuery } from '../../shared/forms/opportunity-search';
@Component({
  imports: [RouterLink, DatePipe, Icon, AsyncState, CategoryLinks, OpportunitySearch],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly auth = inject(AuthStore);
  private readonly api = inject(TalentApi);
  private readonly router = inject(Router);
  readonly managers = MANAGERS;
  readonly staff = STAFF;
  readonly profile = signal<PostulanteDTO | null>(null);
  readonly rows = signal<PostulacionDTO[] | null>(null);
  readonly jobs = signal<VacanteDTO[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly profileError = signal('');
  readonly activityError = signal('');
  readonly tip = signal(true);
  readonly tab = signal<'vacantes' | 'empresas'>('vacantes');
  readonly opportunities = computed(() =>
    this.jobs()
      .filter((j) => j.estado === 'PUBLICADA')
      .slice(0, 5),
  );
  readonly companies = computed(() =>
    [
      ...new Map(
        this.jobs()
          .filter((j) => j.estado === 'PUBLICADA')
          .map((j) => [j.empresa, j]),
      ).values(),
    ].slice(0, 6),
  );
  readonly active = computed(
    () =>
      this.rows()?.filter((a) => !['ACEPTADO', 'RECHAZADO', 'CANCELADO'].includes(a.estado ?? ''))
        .length,
  );
  readonly closed = computed(
    () =>
      this.rows()?.filter((a) => ['ACEPTADO', 'RECHAZADO', 'CANCELADO'].includes(a.estado ?? ''))
        .length,
  );
  constructor() {
    this.load();
    if (this.auth.role() === 'POSTULANTE') this.loadProfile();
    else if (this.auth.role() === 'EVALUADOR') this.loadAssigned();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api
      .vacancies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (v) => this.jobs.set(v), error: (e) => this.error.set(errorMessage(e)) });
  }
  loadProfile() {
    this.profileError.set('');
    this.api.profile(this.auth.session()!.usuarioId!).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.api.applications('postulante', p.id!).subscribe({
          next: (r) => this.rows.set(r),
          error: (e) => this.activityError.set(errorMessage(e)),
        });
      },
      error: (e) => {
        if (e.status !== 404) this.profileError.set(errorMessage(e));
      },
    });
  }
  loadAssigned() {
    this.api.applications('evaluador', this.auth.session()!.usuarioId!).subscribe({
      next: (r) => this.rows.set(r),
      error: (e) => this.activityError.set(errorMessage(e)),
    });
  }
  search(q: OpportunityQuery) {
    void this.router.navigate(['/app/vacantes'], {
      queryParams: { q: q.query, ubicacion: q.location },
    });
  }
}
