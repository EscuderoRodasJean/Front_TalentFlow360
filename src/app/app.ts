import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NoticeStore } from './core/feedback/notice-store';
import { inject } from '@angular/core';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />
    @if (notice.message()) {
      <aside class="toast" [class.error]="notice.kind() === 'error'" role="status">
        <span>{{ notice.message() }}</span><button
          aria-label="Cerrar aviso"
          (click)="notice.clear()"
        >
          ×
        </button>
      </aside>
    }`,
})
export class App {
  readonly notice = inject(NoticeStore);
}
