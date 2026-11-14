import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'tf-brand',
  imports: [RouterLink],
  template: `<a class="tf-brand" [routerLink]="link()" aria-label="TalentFlow360, inicio"
    ><svg viewBox="0 0 40 44" aria-hidden="true">
      <path fill="#2639e8" d="M0 0h40v30L20 44 0 30Z" />
      <path stroke="#e7e7ff" stroke-width="4" fill="none" d="m11 29 18-18M13 11h16v16" /></svg
    ><span>talentflow<strong>360</strong></span></a
  >`,
  styles: [
    `
      .tf-brand {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        color: #18277b;
        font-size: 25px;
        letter-spacing: -1px;
        font-weight: 600;
        white-space: nowrap;
      }
      .tf-brand svg {
        width: 29px;
        height: 35px;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .tf-brand strong {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
        margin-left: 3px;
        color: #5360cc;
      }
      @media (max-width: 500px) {
        .tf-brand {
          font-size: 21px;
        }
        .tf-brand svg {
          width: 25px;
        }
      }
    `,
  ],
})
export class Brand {
  readonly link = input('/');
}
