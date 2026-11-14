import { Component, input, signal } from '@angular/core';
import { Company } from './company-catalog';
@Component({
  selector: 'tf-company-logo',
  template: `<span class="company-logo" [style.background]="company().logoBackground || '#fff'">
    @if (!failed()) {
      <img
        [src]="company().logo"
        [alt]="'Logo oficial de ' + company().name"
        [attr.loading]="eager() ? 'eager' : 'lazy'"
        decoding="async"
        (error)="failed.set(true)"
      />
    } @else {
      <strong>{{ company().name }}</strong>
    }
  </span>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .company-logo {
        width: 100%;
        height: 100%;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        border-radius: 7px;
      }
      .company-logo img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
      }
      .company-logo strong {
        font-size: 14px;
        color: #354267;
        text-align: center;
      }
    `,
  ],
})
export class CompanyLogo {
  readonly company = input.required<Company>();
  readonly eager = input(false);
  readonly failed = signal(false);
}
