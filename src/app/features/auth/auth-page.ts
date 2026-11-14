import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TalentApi } from '../../core/api/talent-api';
import { AuthStore } from '../../core/auth/auth-store';
import { safeReturnUrl } from '../../core/auth/auth-guards';
import { errorMessage } from '../../core/api/http-interceptors';
import { NoticeStore } from '../../core/feedback/notice-store';
import { DataForm, Field, FormValue } from '../../shared/forms/data-form';
import { Brand } from '../../shared/ui/brand';
import { Footer } from '../../shared/ui/footer';
import { Icon } from '../../shared/ui/icon';
@Component({
  imports: [RouterLink, ReactiveFormsModule, DataForm, Brand, Footer, Icon],
  templateUrl: './auth-page.html',
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
  readonly showPassword = signal(false);
  readonly help = signal(false);
  readonly providerNotice = signal('');
  readonly access = signal(
    this.route.snapshot.queryParamMap.get('acceso') === 'equipo' ? 'equipo' : 'postulante',
  );
  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(100)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(72)],
    }),
  });
  readonly fields: Field[] = [
    { key: 'nombre', label: 'Nombre', required: true, maxLength: 80 },
    { key: 'apellido', label: 'Apellido', required: true, maxLength: 80 },
    { key: 'email', label: 'Correo electrónico', type: 'email', required: true, maxLength: 100 },
    {
      key: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true,
      minLength: 8,
      maxLength: 72,
    },
  ];
  submitLogin() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) this.submit(this.loginForm.getRawValue());
  }
  explainProvider(provider: 'Google' | 'LinkedIn') {
    this.providerNotice.set(
      `El acceso con ${provider} aún no está disponible. Por ahora, ingresa con tu correo y contraseña.`,
    );
  }
  submit(value: FormValue) {
    if (this.busy()) return;
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
