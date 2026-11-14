import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { finalize, switchMap } from 'rxjs';
import { TalentApi } from '../../core/api/talent-api';
import { PostulacionDTO, VacanteDTO } from '../../core/api/models';
import { AuthStore, RECRUITERS } from '../../core/auth/auth-store';
import { NoticeStore } from '../../core/feedback/notice-store';
import { errorMessage } from '../../core/api/http-interceptors';
import { AsyncState } from '../../shared/ui/async-state';
import { Status } from '../../shared/ui/status';
@Component({
  imports: [RouterLink, DatePipe, AsyncState, Status],
  template: `<a routerLink="/app/vacantes" class="back">← Todas las oportunidades</a
    ><tf-async-state [loading]="loading()" [error]="error()" (retry)="load()" />
    @if (job(); as j) {
      <header class="page-head">
        <div>
          <p class="eyebrow">{{ j.empresa }}</p>
          <h1>{{ j.titulo }}</h1>
          <div class="row">
            <tf-status [value]="j.estado" /><span class="muted"
              >{{ j.modalidad }} · {{ j.ubicacion }}</span
            >
          </div>
        </div>
        @if (auth.role() === 'POSTULANTE' && j.estado === 'PUBLICADA') {
          <button class="btn primary" (click)="apply()" [disabled]="busy()">
            {{ busy() ? 'Procesando…' : 'Quiero postular' }}
          </button>
        }
        @if (auth.has(recruiters)) {
          <div class="row">
            @if (j.estado === 'BORRADOR') {
              <button class="btn primary" (click)="change('publicar')" [disabled]="busy()">
                Publicar vacante
              </button>
            }
            @if (j.estado === 'PUBLICADA' || j.estado === 'EN_PROCESO') {
              <button class="btn secondary" (click)="confirmClose.set(!confirmClose())">
                Cerrar vacante
              </button>
            }
            <a
              class="btn secondary"
              routerLink="/app/postulaciones"
              [queryParams]="{ vacante: j.id }"
              >Ver postulaciones</a
            >
          </div>
        }
      </header>
      @if (actionError()) {
        <p class="auth-message" role="alert">
          {{ actionError() }}
          @if (actionError().includes('perfil')) {
            <a routerLink="/app/perfil">Completar mi perfil</a>
          }
        </p>
      }
      @if (confirmClose()) {
        <div class="help row between">
          <span>Al cerrar la vacante dejará de aceptar postulaciones. ¿Continuar?</span
          ><button class="btn danger" [disabled]="busy()" (click)="change('cerrar')">
            Confirmar cierre
          </button>
        </div>
      }
      <div class="grid-2 spaced">
        <article class="panel">
          <h2>Sobre la oportunidad</h2>
          <p style="white-space:pre-line">{{ j.descripcion }}</p>
          <hr />
          <div class="row between">
            <span
              >Posiciones disponibles <strong>{{ j.numVacantes }}</strong></span
            ><span
              >Cierre
              {{ j.fechaCierre ? (j.fechaCierre | date: 'dd/MM/yyyy') : 'Por definir' }}</span
            >
          </div>
        </article>
        <section class="panel">
          <h2>Lo que valora el equipo</h2>
          <p>Tu compatibilidad se explica con estos criterios profesionales.</p>
          @for (r of j.requisitos; track r.id) {
            <article class="requirement">
              <div class="row between">
                <strong>{{ r.nombre }}</strong><span class="badge">{{
                  r.obligatorio ? 'Obligatorio' : 'Deseable'
                }}</span>
              </div>
              <p>{{ r.descripcion }}</p>
              <small class="muted"
                >{{ r.tipo?.replaceAll('_', ' ') }} · Peso {{ r.pesoMatching }} · Esperado:
                {{ r.valorEsperado }}</small
              >
            </article>
          } @empty {
            <p>Aún no se han registrado requisitos.</p>
          }
        </section>
      </div>
    }`,
  styles: [
    `
      .requirement {
        padding: 20px 0;
        border-top: 1px solid #e0e7dc;
      }
      .requirement p {
        margin: 9px 0;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class VacancyDetail {
  readonly api = inject(TalentApi);
  readonly auth = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notice = inject(NoticeStore);
  readonly recruiters = RECRUITERS;
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly job = signal<VacanteDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly busy = signal(false);
  readonly confirmClose = signal(false);
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api
      .vacancy(this.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (j) => this.job.set(j), error: (e) => this.error.set(errorMessage(e)) });
  }
  apply() {
    if (this.busy()) return;
    this.busy.set(true);
    this.actionError.set('');
    this.api
      .profile(this.auth.session()!.usuarioId!)
      .pipe(
        switchMap((p) =>
          this.api.client.post<PostulacionDTO>(
            '/postulaciones/postulante/' + p.id + '/vacante/' + this.id,
          ),
        ),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (a) => {
          this.notice.show('Tu postulación fue enviada. Ya puedes consultar el matching.');
          void this.router.navigate(['/app/postulaciones', a.id]);
        },
        error: (e) => this.actionError.set(errorMessage(e)),
      });
  }
  change(action: 'publicar' | 'cerrar') {
    this.busy.set(true);
    this.actionError.set('');
    this.api.client
      .patch<VacanteDTO>('/vacantes/' + this.id + '/' + action)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (j) => {
          this.job.set(j);
          this.confirmClose.set(false);
          this.notice.show(action === 'publicar' ? 'Vacante publicada.' : 'Vacante cerrada.');
        },
        error: (e) => this.actionError.set(errorMessage(e)),
      });
  }
}
