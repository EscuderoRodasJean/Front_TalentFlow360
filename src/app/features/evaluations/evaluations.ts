import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { AuthStore, REVIEWERS } from '../../core/auth/auth-store';
import { TalentApi } from '../../core/api/talent-api';
import { EvaluacionDTO } from '../../core/api/models';
import { NoticeStore } from '../../core/feedback/notice-store';
import { errorMessage } from '../../core/api/http-interceptors';
import { AsyncState } from '../../shared/ui/async-state';
import { DataForm, Field, FormValue } from '../../shared/forms/data-form';
import { ArrayEditor } from '../../shared/forms/array-editor';
@Component({
  imports: [FormsModule, DatePipe, AsyncState, DataForm, ArrayEditor],
  template: `<header class="page-head">
      <div>
        <p class="eyebrow">CRITERIOS CLAROS, MEJORES DECISIONES</p>
        <h1>Evaluar para acompañar.</h1>
        <p>
          Registra una valoración profesional y ofrece retroalimentación con visibilidad explícita.
        </p>
      </div>
    </header>
    <div class="filters">
      <div class="field">
        <label for="eval-scope">Consultar por</label
        ><select id="eval-scope" [(ngModel)]="scope">
          <option value="evaluador">Evaluador</option>
          <option value="postulacion">Postulación</option>
        </select>
      </div>
      <div class="field">
        <label for="eval-id">ID de consulta</label
        ><input id="eval-id" type="number" min="1" [(ngModel)]="lookupId" />
      </div>
      <button class="btn secondary" (click)="load()">Consultar evaluaciones</button>
    </div>
    <tf-async-state [loading]="loading()" [error]="error()" (retry)="load()" />
    <section class="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>Postulación</th>
            <th>Evaluador</th>
            <th>Puntaje</th>
            <th>Fecha</th>
            <th>Comentario</th>
          </tr>
        </thead>
        <tbody>
          @for (e of rows(); track e.id) {
            <tr>
              <td>#{{ e.postulacionId }}</td>
              <td>{{ e.evaluadorNombre }}</td>
              <td>{{ e.puntajeGeneral }}/100</td>
              <td>{{ e.fechaEvaluacion | date: 'dd/MM/yyyy' }}</td>
              <td>{{ e.comentarios }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5">No hay evaluaciones para esta consulta.</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
    @if (actionError()) {
      <p class="auth-message" role="alert">{{ actionError() }}</p>
    }
    @if (auth.has(reviewers)) {
      <div class="grid-2 spaced">
        <section class="panel">
          <h2>Registrar evaluación</h2>
          <tf-array-editor
            label="criterio"
            [fields]="criteriaFields"
            (changed)="criteria.set($event)"
          />
          <hr />
          <tf-data-form
            prefix="evaluation"
            [fields]="evaluationFields"
            [busy]="busy()"
            label="Guardar evaluación"
            (submitted)="evaluate($event)"
          />
        </section>
        <section class="panel">
          <h2>Dar retroalimentación</h2>
          <p>La opción de visibilidad habilita el comentario para el postulante.</p>
          <tf-data-form
            prefix="feedback"
            [fields]="feedbackFields"
            [busy]="busy()"
            label="Registrar retroalimentación"
            (submitted)="feedback($event)"
          />
        </section>
      </div>
    }`,
})
export class Evaluations {
  readonly auth = inject(AuthStore);
  private readonly api = inject(TalentApi);
  private readonly notice = inject(NoticeStore);
  private readonly route = inject(ActivatedRoute);
  readonly reviewers = REVIEWERS;
  scope = this.route.snapshot.queryParamMap.has('postulacion') ? 'postulacion' : 'evaluador';
  lookupId =
    Number(this.route.snapshot.queryParamMap.get('postulacion')) || this.auth.session()!.usuarioId!;
  readonly rows = signal<EvaluacionDTO[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly criteria = signal<FormValue[]>([]);
  readonly criteriaFields: Field[] = [
    { key: 'nombre', label: 'Criterio profesional', required: true, maxLength: 100 },
    { key: 'puntaje', label: 'Puntaje obtenido', type: 'number', required: true, min: 0, max: 100 },
    {
      key: 'puntajeMaximo',
      label: 'Puntaje máximo',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
      value: 100,
    },
    { key: 'comentario', label: 'Justificación', type: 'textarea', required: true, maxLength: 500 },
  ];
  readonly evaluationFields: Field[] = [
    {
      key: 'postulacionId',
      label: 'ID de postulación',
      type: 'number',
      required: true,
      min: 1,
      value: Number(this.route.snapshot.queryParamMap.get('postulacion')) || '',
    },
    { key: 'entrevistaId', label: 'ID de entrevista (opcional)', type: 'number', min: 1 },
    {
      key: 'puntajeGeneral',
      label: 'Puntaje general (0 a 100)',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
    },
    { key: 'comentarios', label: 'Comentarios', type: 'textarea', required: true, maxLength: 1000 },
  ];
  readonly feedbackFields: Field[] = [
    {
      key: 'postulacionId',
      label: 'ID de postulación',
      type: 'number',
      required: true,
      min: 1,
      value: Number(this.route.snapshot.queryParamMap.get('postulacion')) || '',
    },
    {
      key: 'contenido',
      label: 'Retroalimentación',
      type: 'textarea',
      required: true,
      minLength: 5,
      maxLength: 2000,
    },
    { key: 'visiblePostulante', label: 'Visible para el postulante', type: 'checkbox' },
  ];
  constructor() {
    this.load();
  }
  load() {
    if (!(this.lookupId > 0)) {
      this.error.set('Introduce un ID válido.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api.client
      .get<EvaluacionDTO[]>('/evaluaciones/' + this.scope + '/' + this.lookupId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (r) => this.rows.set(r), error: (e) => this.error.set(errorMessage(e)) });
  }
  evaluate(v: FormValue) {
    if (
      !this.criteria().length ||
      this.criteria().some((c) => Number(c['puntaje']) > Number(c['puntajeMaximo']))
    ) {
      this.actionError.set(
        'Agrega criterios válidos: el puntaje obtenido no puede superar el máximo.',
      );
      return;
    }
    this.save('/evaluaciones/evaluador/' + this.auth.session()!.usuarioId, {
      ...v,
      entrevistaId: v['entrevistaId'] || null,
      criterios: this.criteria(),
    });
  }
  feedback(v: FormValue) {
    this.save('/evaluaciones/retroalimentacion/evaluador/' + this.auth.session()!.usuarioId, v);
  }
  private save(path: string, body: unknown) {
    this.busy.set(true);
    this.actionError.set('');
    this.api.client
      .post(path, body)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.notice.show('Registro guardado correctamente.');
          this.load();
        },
        error: (e) => this.actionError.set(errorMessage(e)),
      });
  }
}
