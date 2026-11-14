import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand } from './brand';
@Component({
  selector: 'tf-footer',
  imports: [RouterLink, Brand],
  template: `<footer class="portal-footer">
    <div class="footer-content">
      <section>
        <tf-brand />
        <p>
          El comienzo de tu historia profesional.<br />Prácticas con criterios claros y seguimiento
          de principio a fin.
        </p>
        <span class="project-label">Proyecto académico · Datos de demostración</span>
      </section>
      <section>
        <h2>Para tu siguiente paso</h2>
        <a routerLink="/registro">Crear mi perfil</a
        ><a routerLink="/app/vacantes">Explorar oportunidades</a
        ><a routerLink="/app/postulaciones">Seguir mis postulaciones</a>
      </section>
      <section>
        <h2>Sobre TalentFlow360</h2>
        <a routerLink="/" fragment="como-funciona">Cómo funciona</a
        ><a routerLink="/" fragment="matching">Matching explicable</a
        ><a routerLink="/ingresar" [queryParams]="{ acceso: 'equipo' }"
          >Acceso del equipo de selección</a
        >
      </section>
    </div>
    <div class="footer-bottom">
      <span>© {{ year }} TalentFlow360. Desarrollo Web Integrado.</span
      ><span>Hecho para conectar talento y oportunidades.</span>
    </div>
  </footer>`,
  styleUrl: './footer.scss',
})
export class Footer {
  readonly year = new Date().getFullYear();
}
