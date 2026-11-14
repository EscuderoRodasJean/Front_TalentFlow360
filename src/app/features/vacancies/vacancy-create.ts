import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthStore } from '../../core/auth/auth-store';
import { TalentApi } from '../../core/api/talent-api';
import { VacanteDTO } from '../../core/api/models';
import { errorMessage } from '../../core/api/http-interceptors';
import { DataForm, Field, FormValue } from '../../shared/forms/data-form';
import { ArrayEditor } from '../../shared/forms/array-editor';
import { TYPES } from '../../shared/forms/fields';
@Component({
  imports: [RouterLink, DataForm, ArrayEditor],
  template: `<a class="back" routerLink="/app/vacantes">← Oportunidades</a>
    <header class="page-head">
      <div>
        <p class="eyebrow">CONECTA CON EL POTENCIAL</p>
        <h1>Una oportunidad con claridad.</h1>
        <p>Define primero los requisitos. La vacante se creará en borrador.</p>
      </div>
    </header>
    <div class="grid-2">
      <section class="panel">
        <h2>Datos de la vacante</h2>
        @if (error()) {
          <p class="auth-message" role="alert">{{ error() }}</p>
        }
        <tf-data-form
          [fields]="fields"
          [busy]="busy()"
          label="Crear borrador"
          (submitted)="save($event)"
        />
      </section>
      <section class="panel">
        <h2>Requisitos profesionales</h2>
        <p>Agrega al menos un requisito con peso positivo para obtener un matching explicable.</p>
        <tf-array-editor [fields]="requirements" (changed)="items.set($event)" />
      </section>
    </div>`,
})
export class VacancyCreate {
  private readonly api = inject(TalentApi);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly items = signal<FormValue[]>([]);
  readonly fields: Field[] = [
    { key: 'titulo', label: 'Título del puesto', required: true, maxLength: 150 },
    { key: 'empresa', label: 'Empresa', required: true, maxLength: 150 },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true, maxLength: 2000 },
    { key: 'ubicacion', label: 'Ubicación', maxLength: 150 },
    {
      key: 'modalidad',
      label: 'Modalidad',
      required: true,
      options: ['HIBRIDO', 'REMOTO', 'PRESENCIAL'],
    },
    {
      key: 'numVacantes',
      label: 'Posiciones',
      type: 'number',
      min: 1,
      max: 1000,
      required: true,
      value: 1,
    },
    { key: 'fechaCierre', label: 'Fecha de cierre', type: 'date', required: true },
  ];
  readonly requirements: Field[] = [
    { key: 'nombre', label: 'Requisito', required: true, maxLength: 100 },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', maxLength: 300 },
    { key: 'tipo', label: 'Tipo', options: TYPES, required: true },
    { key: 'valorEsperado', label: 'Valor esperado', required: true, maxLength: 100 },
    {
      key: 'pesoMatching',
      label: 'Peso en el matching',
      type: 'number',
      min: 1,
      max: 100,
      required: true,
      value: 10,
    },
    { key: 'obligatorio', label: 'Obligatorio', type: 'checkbox' },
  ];
  save(value: FormValue) {
    if (!this.items().length) {
      this.error.set('Agrega al menos un requisito antes de crear la vacante.');
      return;
    }
    if (String(value['fechaCierre']) < new Date().toLocaleDateString('en-CA')) {
      this.error.set('La fecha de cierre debe ser hoy o una fecha futura.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.api.client
      .post<VacanteDTO>('/vacantes/reclutador/' + this.auth.session()!.usuarioId, {
        ...value,
        requisitos: this.items(),
      })
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (v) => void this.router.navigate(['/app/vacantes', v.id]),
        error: (e) => this.error.set(errorMessage(e)),
      });
  }
}
