import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { TalentApi } from '../../core/api/talent-api';
import { DashboardDTO } from '../../core/api/models';
import { errorMessage } from '../../core/api/http-interceptors';
import { AsyncState } from '../../shared/ui/async-state';
import { Status } from '../../shared/ui/status';
@Component({
  imports: [DecimalPipe, KeyValuePipe, AsyncState, Status],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly api = inject(TalentApi);
  readonly data = signal<DashboardDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly loadedAt = signal('');
  readonly metrics = computed(() => {
    const d = this.data();
    return d
      ? [
          {
            code: 'I1.1',
            label: 'Perfiles incompletos',
            value: d.totalPostulantes ? d.porcentajePerfilesIncompletos : undefined,
            unit: '%',
            base: 'Línea base: 34%',
            target: 'Meta ≤ 20%',
            met: !!d.totalPostulantes && (d.porcentajePerfilesIncompletos ?? 101) <= 20,
          },
          {
            code: 'I1.2',
            label: 'Completitud promedio',
            value: d.totalPostulantes ? d.promedioCompletitud : undefined,
            unit: '%',
            base: 'Seis apartados del perfil',
            target: 'Promedio del servidor',
            met: !!d.totalPostulantes,
          },
          {
            code: 'I2.2',
            label: 'Sin seguimiento',
            value: d.totalPostulaciones ? d.porcentajeSinSeguimiento : undefined,
            unit: '%',
            base: 'Estado pendiente de revisión',
            target: 'Meta ≤ 10%',
            met: !!d.totalPostulaciones && (d.porcentajeSinSeguimiento ?? 101) <= 10,
          },
          {
            code: 'I4.1',
            label: 'Finalizadas sin feedback',
            value:
              (d.distribucionEstadoPostulaciones?.['ACEPTADO'] || 0) +
              (d.distribucionEstadoPostulaciones?.['RECHAZADO'] || 0)
                ? d.porcentajeSinRetroalimentacion
                : undefined,
            unit: '%',
            base: 'Línea base: 26%',
            target: 'Meta ≤ 10%',
            met:
              !!(
                (d.distribucionEstadoPostulaciones?.['ACEPTADO'] || 0) +
                (d.distribucionEstadoPostulaciones?.['RECHAZADO'] || 0)
              ) && (d.porcentajeSinRetroalimentacion ?? 101) <= 10,
          },
        ]
      : [];
  });
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api
      .dashboard()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => {
          this.data.set(d);
          this.loadedAt.set(
            new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          );
        },
        error: (e) => this.error.set(errorMessage(e)),
      });
  }
  maxStage() {
    return Math.max(1, ...Object.values(this.data()?.distribucionEstadoPostulaciones ?? {}));
  }
}
