import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TalentApi } from '../../core/api/talent-api';
import { AuthStore } from '../../core/auth/auth-store';
import { safeReturnUrl } from '../../core/auth/auth-guards';
import { errorMessage } from '../../core/api/http-interceptors';
import { NoticeStore } from '../../core/feedback/notice-store';
import { DataForm, Field, FormValue } from '../../shared/forms/data-form';
@Component({
  imports: [RouterLink, DataForm],
  template: `<main class="auth-layout">
    <section class="story">
      <a routerLink="/" class="brand"><span class="brand-mark">↗</span>talentflow360</a>
      <div>
        <p class="eyebrow">UN PROCESO, MUCHAS POSIBILIDADES</p>
        <h1>Lo que sabes.<br />Lo que puedes<br /><em>llegar a ser.</em></h1>
        <p>
          Conecta con oportunidades y conoce el camino<br />de tu postulación, de principio a fin.
        </p>
      </div>
      <small>Matching profesional. Seguimiento transparente.</small>
    </section>
    <section class="auth-panel">
      <a routerLink="/" class="back">← Volver al inicio</a>
      <p class="eyebrow">{{ register ? 'CREA TU CUENTA' : 'QUÉ BUENO VERTE' }}</p>
      <h2>{{ register ? 'Tu próximo paso empieza aquí.' : 'Entra a tu espacio.' }}</h2>
      <p>
        {{
          register
            ? 'El registro público es para postulantes.'
            : 'Ingresa con el correo de tu cuenta TalentFlow360.'
        }}
      </p>
      @if (error()) {
        <div class="auth-message" role="alert">{{ error() }}</div>
      }
      <tf-data-form
        [fields]="fields"
        [busy]="busy()"
        [label]="register ? 'Crear cuenta' : 'Iniciar sesión'"
        (submitted)="submit($event)"
      />
      <p class="bottom">
        {{ register ? '¿Ya tienes una cuenta?' : '¿Es tu primera vez aquí?' }}
        <a [routerLink]="register ? '/ingresar' : '/registro'">{{
          register ? 'Inicia sesión' : 'Crea tu perfil'
        }}</a>
      </p>
      <small class="muted"
        >Por tu seguridad, al recargar la página deberás volver a ingresar.</small
      >
    </section>
  </main>`,
  styleUrl: './auth-page.scss',
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TalentApi);
  private readonly auth = inject(AuthStore);
  private readonly notice = inject(NoticeStore);
  readonly register = this.route.snapshot.data['register'] === true;
  readonly busy = signal(false);
  readonly error = signal('');
  readonly fields: Field[] = [
    ...(this.register
      ? [
          { key: 'nombre', label: 'Nombre', required: true, maxLength: 80 },
          { key: 'apellido', label: 'Apellido', required: true, maxLength: 80 },
        ]
      : []),
    { key: 'email', label: 'Correo electrónico', type: 'email', required: true, maxLength: 100 },
    {
      key: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true,
      minLength: this.register ? 8 : 1,
      maxLength: 72,
    },
  ];
  submit(value: FormValue) {
    this.busy.set(true);
    this.error.set('');
    const body = { ...value, email: String(value['email']).trim(), rol: 'POSTULANTE' };
    if (this.register) {
      this.api
        .register(body)
        .pipe(finalize(() => this.busy.set(false)))
        .subscribe({
          next: () => {
            this.notice.show('Tu cuenta está lista. Inicia sesión para completar tu perfil.');
            void this.router.navigate(['/ingresar']);
          },
          error: (e) => this.error.set(errorMessage(e)),
        });
    } else {
      this.api
        .login({ email: body.email, password: String(value['password']) })
        .pipe(finalize(() => this.busy.set(false)))
        .subscribe({
          next: (session) => {
            try {
              this.auth.set(session);
              void this.router.navigateByUrl(
                safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')),
              );
            } catch (e) {
              this.error.set(errorMessage(e));
            }
          },
          error: (e) => this.error.set(errorMessage(e)),
        });
    }
  }
}
