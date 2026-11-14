import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthStore, ROLES } from '../../core/auth/auth-store';
import { TalentApi } from '../../core/api/talent-api';
import { UsuarioDTO } from '../../core/api/models';
import { NoticeStore } from '../../core/feedback/notice-store';
import { errorMessage } from '../../core/api/http-interceptors';
import { AsyncState } from '../../shared/ui/async-state';
import { DataForm, Field, FormValue } from '../../shared/forms/data-form';
@Component({
  imports: [FormsModule, AsyncState, DataForm],
  template: `<header class="page-head">
      <div>
        <p class="eyebrow">PERSONAS Y RESPONSABILIDADES</p>
        <h1>El equipo detrás de cada paso.</h1>
        <p>Gestiona cuentas con roles explícitos y conserva el historial al desactivarlas.</p>
      </div>
      <button class="btn primary" (click)="create()">Agregar cuenta</button>
    </header>
    <div class="filters">
      <div class="field search">
        <label for="user-search">Buscar persona</label
        ><input
          id="user-search"
          [ngModel]="query()"
          (ngModelChange)="query.set($event); page.set(1)"
        />
      </div>
      <div class="field">
        <label for="role-filter">Rol</label
        ><select
          id="role-filter"
          [ngModel]="role()"
          (ngModelChange)="role.set($event); page.set(1)"
        >
          <option value="">Todos los roles</option>
          @for (r of roles; track r) {
            <option>{{ r }}</option>
          }
        </select>
      </div>
    </div>
    <tf-async-state [loading]="loading()" [error]="error()" (retry)="load()" />
    <section class="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>Persona</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (u of visible(); track u.id) {
            <tr>
              <td>
                <strong>{{ u.nombre }} {{ u.apellido }}</strong>
              </td>
              <td>{{ u.email }}</td>
              <td>{{ u.rol }}</td>
              <td>
                <span class="badge" [class.positive]="u.activo">{{
                  u.activo ? 'Activo' : 'Inactivo'
                }}</span>
              </td>
              <td>
                <div class="row">
                  <span
                    class="muted"
                    title="El contrato PUT actual exige una contraseña que el servicio ignora. Requiere corrección en backend."
                    >Edición pendiente de API</span
                  >
                  @if (
                    auth.role() === 'ADMINISTRADOR' &&
                    u.activo &&
                    u.id !== auth.session()?.usuarioId
                  ) {
                    <button class="btn quiet" (click)="confirm.set(u)">Desactivar</button>
                  }
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5">No hay cuentas para esta búsqueda.</td>
            </tr>
          }
        </tbody>
      </table>
      <div class="pagination">
        <span>{{ filtered().length }} cuentas · Página {{ page() }}</span>
        <div class="row">
          <button class="btn secondary" [disabled]="page() === 1" (click)="page.set(page() - 1)">
            Anterior</button
          ><button
            class="btn secondary"
            [disabled]="page() * 15 >= filtered().length"
            (click)="page.set(page() + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
    @if (confirm(); as user) {
      <section class="panel spaced" role="alert">
        <h2>¿Desactivar a {{ user.nombre }}?</h2>
        <p>La cuenta perderá acceso. Se conservará su historial.</p>
        <div class="row">
          <button class="btn danger" [disabled]="busy()" (click)="deactivate(user.id!)">
            Confirmar desactivación</button
          ><button class="btn secondary" (click)="confirm.set(null)">Cancelar</button>
        </div>
      </section>
    }
    @if (actionError()) {
      <p class="auth-message" role="alert">{{ actionError() }}</p>
    }
    @if (showForm()) {
      <section class="panel spaced">
        <div class="row between">
          <h2>{{ editing() ? 'Editar cuenta' : 'Agregar una persona' }}</h2>
          <button class="btn quiet" (click)="showForm.set(false)">Cerrar</button>
        </div>
        <tf-data-form
          [fields]="fields()"
          [values]="values()"
          [busy]="busy()"
          (submitted)="save($event)"
        />
      </section>
    }`,
})
export class Users {
  readonly auth = inject(AuthStore);
  private readonly api = inject(TalentApi);
  private readonly notice = inject(NoticeStore);
  readonly roles = ROLES;
  readonly rows = signal<UsuarioDTO[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly query = signal('');
  readonly role = signal('');
  readonly page = signal(1);
  readonly editing = signal<UsuarioDTO | null>(null);
  readonly confirm = signal<UsuarioDTO | null>(null);
  readonly showForm = signal(false);
  readonly values = signal<FormValue>({});
  readonly fields = computed<Field[]>(() => [
    { key: 'nombre', label: 'Nombre', required: true, maxLength: 80 },
    { key: 'apellido', label: 'Apellido', required: true, maxLength: 80 },
    { key: 'email', label: 'Correo', type: 'email', required: true, maxLength: 100 },
    ...(!this.editing()
      ? [
          {
            key: 'password',
            label: 'Contraseña inicial',
            type: 'password',
            required: true,
            minLength: 8,
            maxLength: 72,
          },
        ]
      : []),
    { key: 'rol', label: 'Rol', required: true, options: ROLES },
  ]);
  readonly filtered = computed(() =>
    this.rows().filter(
      (u) =>
        (!this.role() || u.rol === this.role()) &&
        [u.nombre, u.apellido, u.email]
          .join(' ')
          .toLowerCase()
          .includes(this.query().toLowerCase()),
    ),
  );
  readonly visible = computed(() =>
    this.filtered().slice((this.page() - 1) * 15, this.page() * 15),
  );
  constructor() {
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.client
      .get<UsuarioDTO[]>('/usuarios')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (u) => this.rows.set(u), error: (e) => this.error.set(errorMessage(e)) });
  }
  create() {
    this.editing.set(null);
    this.values.set({});
    this.showForm.set(true);
  }
  edit(u: UsuarioDTO) {
    this.editing.set(u);
    this.values.set({
      nombre: u.nombre ?? '',
      apellido: u.apellido ?? '',
      email: u.email ?? '',
      rol: u.rol ?? '',
    });
    this.showForm.set(true);
  }
  save(v: FormValue) {
    if (this.editing()) {
      this.actionError.set(
        'La API actual exige una contraseña al editar, aunque no la actualiza. Esta operación requiere corregir el DTO de actualización del backend.',
      );
      return;
    }
    this.busy.set(true);
    this.actionError.set('');
    this.api.client
      .post('/usuarios', v)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.showForm.set(false);
          this.notice.show('Cuenta guardada.');
          this.load();
        },
        error: (e) => this.actionError.set(errorMessage(e)),
      });
  }
  deactivate(id: number) {
    this.busy.set(true);
    this.actionError.set('');
    this.api.client
      .patch('/usuarios/' + id + '/desactivar')
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.confirm.set(null);
          this.notice.show('Cuenta desactivada.');
          this.load();
        },
        error: (e) => this.actionError.set(errorMessage(e)),
      });
  }
}
