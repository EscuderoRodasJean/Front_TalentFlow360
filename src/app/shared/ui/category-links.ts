import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';
@Component({
  selector: 'tf-category-links',
  imports: [RouterLink, Icon],
  template: `<div class="category-links">
    @for (c of categories; track c.query) {
      <a routerLink="/app/vacantes" [queryParams]="{ q: c.query }"
        ><span [class]="'category-icon ' + c.color"><tf-icon [name]="c.icon" /></span
        ><strong>{{ c.title }}</strong
        ><span class="chevron">›</span></a
      >
    }
  </div>`,
  styles: [
    `
      .category-links {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .category-links a {
        padding: 15px;
        background: white;
        box-shadow: 0 3px 12px #28356210;
        border: 1px solid #edf0f6;
        border-radius: 10px;
        display: flex;
        gap: 12px;
        align-items: center;
        transition: transform 0.15s;
      }
      .category-links a:hover {
        transform: translateY(-3px);
        border-color: #b9bffc;
      }
      .category-icon {
        padding: 10px;
        border-radius: 8px;
        display: flex;
        color: #333854;
      }
      .category-icon.pink {
        background: #fae8ff;
      }
      .category-icon.yellow {
        background: #fff1bd;
      }
      .category-icon.cyan {
        background: #d8f7f8;
      }
      .category-links strong {
        font-size: 13px;
        font-weight: 600;
        color: #272f51;
      }
      .chevron {
        margin-left: auto;
        font-size: 22px;
        color: #353b5b;
      }
      @media (max-width: 600px) {
        .category-links {
          grid-template-columns: 1fr;
        }
        .category-links a {
          padding: 11px 15px;
        }
        .category-links strong {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class CategoryLinks {
  readonly categories = [
    { title: 'Prácticas en tecnología', query: 'desarrollo', icon: 'code', color: 'pink' },
    { title: 'Análisis y negocios', query: 'datos', icon: 'chart', color: 'yellow' },
    { title: 'Diseño y creatividad', query: 'diseño', icon: 'spark', color: 'cyan' },
  ];
}
