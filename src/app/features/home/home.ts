import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore, MANAGERS, STAFF } from '../../core/auth/auth-store';
import { Icon } from '../../shared/ui/icon';
@Component({
  imports: [RouterLink, Icon],
  template: `<p class="eyebrow">TU ESPACIO TALENTFLOW</p>
    <section class="welcome-banner">
      <div>
        <h1>Hola, {{ auth.name().split(' ')[0] }}.<br />Hagamos que el talento avance.</h1>
        <p>
          {{
            auth.role() === 'POSTULANTE'
              ? 'Tu perfil cuenta una historia. Encuentra dónde continuarla.'
              : 'Todo lo que necesitas para acompañar el siguiente paso de cada postulante.'
          }}
        </p>
        <a class="btn lime" routerLink="/app/vacantes"
          >Explorar oportunidades <tf-icon name="arrow"
        /></a>
      </div>
      <div class="banner-glyph" aria-hidden="true">↗</div>
    </section>
    <div class="section-head">
      <h2>Un proceso claro, paso a paso</h2>
      <span class="muted">¿Por dónde empezamos?</span>
    </div>
    <div class="home-grid">
      @for (card of cards; track card.route) {
        @if (!card.roles || auth.has(card.roles)) {
          <a class="home-card" [routerLink]="'/app/' + card.route"
            ><tf-icon [name]="card.icon" />
            <h3>{{ card.title }}</h3>
            <p>{{ card.body }}</p>
            <span>Ir a mi espacio <tf-icon name="arrow" /></span
          ></a>
        }
      }
    </div>
    <section class="principles">
      <tf-icon name="shield" />
      <div>
        <h3>El potencial se evalúa con criterios profesionales.</h3>
        <p>
          Conoce el desglose del matching, la razón de cada cambio y la retroalimentación que se ha
          habilitado para ti.
        </p>
      </div>
    </section>`,
  styleUrl: './home.scss',
})
export class Home {
  readonly auth = inject(AuthStore);
  readonly cards = [
    {
      route: 'perfil',
      title: 'Dale forma a tu perfil',
      body: 'Educación, experiencia y habilidades para mostrar lo que sabes.',
      icon: 'user',
      roles: ['POSTULANTE'] as const,
    },
    {
      route: 'postulaciones',
      title: 'Cada paso, a la vista',
      body: 'Consulta el estado, el matching explicable y el historial del proceso.',
      icon: 'layers',
    },
    {
      route: 'entrevistas',
      title: 'Una agenda sin cruces',
      body: 'Organiza encuentros y consulta las entrevistas de tu equipo.',
      icon: 'calendar',
      roles: STAFF,
    },
    {
      route: 'indicadores',
      title: 'Decisiones con contexto',
      body: 'Completitud, seguimiento y retroalimentación desde la persistencia.',
      icon: 'chart',
      roles: MANAGERS,
    },
  ];
}
