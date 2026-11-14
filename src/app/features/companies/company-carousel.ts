import {
  afterNextRender,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPANIES } from './company-catalog';
import { CompanyLogo } from './company-logo';
import { Icon } from '../../shared/ui/icon';
@Component({
  selector: 'tf-company-carousel',
  imports: [RouterLink, CompanyLogo, Icon],
  template: `<section
    class="companies-section"
    id="empresas"
    aria-labelledby="companies-heading"
    role="region"
    aria-roledescription="carrusel"
    (mouseenter)="hovered.set(true)"
    (mouseleave)="hovered.set(false)"
    (focusin)="focused.set(true)"
    (focusout)="focused.set(false)"
  >
    <h2 id="companies-heading">Conoce las empresas donde puede empezar tu futuro.</h2>
    <p>Explora su actividad y conoce las oportunidades registradas en TalentFlow360.</p>
    <div class="carousel-shell">
      <button class="carousel-arrow previous" aria-label="Empresas anteriores" (click)="move(-1)">
        <tf-icon name="arrow" />
      </button>
      <div #viewport class="carousel-viewport">
        <div
          class="carousel-track"
          [class.animated]="animated()"
          [style.--visible]="slots()"
          [style.transform]="'translateX(-' + (index() * 100) / slots() + '%)'"
          (transitionend)="finish($event)"
        >
          @for (company of slides; track $index; let i = $index) {
            <div
              class="company-slide"
              [attr.aria-hidden]="i < index() || i >= index() + slots() ? 'true' : null"
            >
              <a
                class="company-tile"
                [routerLink]="['/empresas', company.slug]"
                [attr.tabindex]="i < index() || i >= index() + slots() ? -1 : 0"
                [attr.aria-label]="'Conocer ' + company.name"
                ><tf-company-logo [company]="company" [eager]="true"
              /></a>
            </div>
          }
        </div>
      </div>
      <button class="carousel-arrow next" aria-label="Empresas siguientes" (click)="move(1)">
        <tf-icon name="arrow" />
      </button>
    </div>
    <div class="carousel-actions">
      <a routerLink="/empresas" class="btn secondary"
        ><tf-icon name="briefcase" />Ver todas las empresas</a
      ><button
        class="autoplay-toggle"
        [attr.aria-label]="
          playing() ? 'Pausar carrusel automático' : 'Reproducir carrusel automático'
        "
        [attr.aria-pressed]="!playing()"
        (click)="playing.set(!playing())"
      >
        <tf-icon [name]="playing() ? 'pause' : 'play'" />
      </button>
    </div>
  </section>`,
  styleUrl: './company-carousel.scss',
})
export class CompanyCarousel implements OnDestroy {
  @ViewChild('viewport') viewport?: ElementRef<HTMLElement>;
  readonly companies = COMPANIES;
  readonly slides = [...COMPANIES, ...COMPANIES, ...COMPANIES];
  readonly index = signal(COMPANIES.length);
  readonly slots = signal(6);
  readonly animated = signal(true);
  readonly playing = signal(false);
  readonly hovered = signal(false);
  readonly focused = signal(false);
  private observer?: ResizeObserver;
  private timer?: ReturnType<typeof setInterval>;
  private frame1?: number;
  private frame2?: number;
  private motion?: MediaQueryList;
  private moving = false;
  private readonly motionChanged = (event: MediaQueryListEvent) => this.playing.set(!event.matches);
  constructor() {
    afterNextRender(() => this.initialize());
  }
  private initialize() {
    this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.playing.set(!this.motion.matches);
    this.motion.addEventListener('change', this.motionChanged);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.viewport!.nativeElement);
    this.resize();
    this.timer = setInterval(() => {
      if (this.playing() && !this.hovered() && !this.focused() && !document.hidden) this.move(1);
    }, 4000);
  }
  private resize() {
    this.moving = false;
    const w = this.viewport?.nativeElement.clientWidth ?? 1000;
    const slots = w >= 1000 ? 6 : w >= 760 ? 4 : w >= 560 ? 3 : w >= 320 ? 2 : 1;
    if (slots !== this.slots()) {
      this.animated.set(false);
      this.slots.set(slots);
      this.restoreAnimation();
    }
  }
  move(delta: number) {
    if (!this.animated() || this.moving) return;
    this.moving = true;
    this.index.update((i) => i + delta);
    if (this.motion?.matches) {
      this.moving = false;
      this.wrap();
    }
  }
  finish(event: TransitionEvent) {
    if (event.propertyName === 'transform') {
      this.moving = false;
      this.wrap();
    }
  }
  private wrap() {
    const n = COMPANIES.length;
    if (this.index() >= 2 * n || this.index() < n) {
      this.animated.set(false);
      this.index.set(this.index() >= 2 * n ? this.index() - n : this.index() + n);
      this.restoreAnimation();
    }
  }
  private restoreAnimation() {
    if (this.frame1) cancelAnimationFrame(this.frame1);
    if (this.frame2) cancelAnimationFrame(this.frame2);
    this.frame1 = requestAnimationFrame(() => {
      this.frame2 = requestAnimationFrame(() => this.animated.set(true));
    });
  }
  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.timer) clearInterval(this.timer);
    if (this.frame1) cancelAnimationFrame(this.frame1);
    if (this.frame2) cancelAnimationFrame(this.frame2);
    this.motion?.removeEventListener('change', this.motionChanged);
  }
}
