import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { AuthStore } from '../../core/auth/auth-store';
import { TalentApi } from '../../core/api/talent-api';
import { VacanteDTO } from '../../core/api/models';
import { errorMessage } from '../../core/api/http-interceptors';
import { Company, belongsToCompany } from './company-catalog';
@Injectable({ providedIn: 'root' })
export class CompanyVacancies {
  readonly auth = inject(AuthStore);
  private readonly api = inject(TalentApi);
  private readonly destroy = inject(DestroyRef);
  private request?: Subscription;
  readonly jobs = signal<VacanteDTO[] | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly signedIn = computed(() => !!this.auth.session()?.token);
  constructor() {
    effect(() => {
      this.auth.session();
      this.request?.unsubscribe();
      this.jobs.set(null);
      this.error.set('');
      this.loading.set(false);
      if (this.auth.valid()) this.load();
    });
    this.destroy.onDestroy(() => this.request?.unsubscribe());
  }
  load() {
    if (!this.auth.valid()) return;
    this.request?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.request = this.api
      .vacancies()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (jobs) => this.jobs.set(jobs.filter((j) => j.estado === 'PUBLICADA')),
        error: (e) => this.error.set(errorMessage(e)),
      });
  }
  count(company: Company): number | null {
    if (!this.auth.valid() || this.jobs() === null) return null;
    return this.jobs()!.filter((j) => belongsToCompany(company, j.empresa)).length;
  }
  forCompany(company: Company): VacanteDTO[] {
    return this.auth.valid()
      ? (this.jobs()?.filter((j) => belongsToCompany(company, j.empresa)) ?? [])
      : [];
  }
}
