import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'tf-brand',
  imports: [RouterLink],
  template: `<a class="tf-brand" [routerLink]="link()" aria-label="TalentFlow360, inicio"
    ><svg viewBox="0 0 35 38" aria-hidden="true">
      <path d="m5 5 14 14L5 33" stroke="#b546e8" stroke-width="7" />
      <path d="m13 5 14 14-14 14" stroke="#2639e8" stroke-width="7" />
      <path d="m4 5 14 14" stroke="#22ced3" stroke-width="4" /></svg
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
