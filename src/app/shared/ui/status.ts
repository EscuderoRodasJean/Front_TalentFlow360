import { Component, input } from '@angular/core';
export function humanize(value: unknown): string {
  return String(value ?? 'Sin información')
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (c) => c.toUpperCase());
}
@Component({
  selector: 'tf-status',
  template: `<span class="badge" [class.positive]="positive()">{{ label() }}</span>`,
})
export class Status {
  readonly value = input<unknown>('');
  label() {
    return humanize(this.value());
  }
  positive() {
    return ['PUBLICADA', 'ACEPTADO', 'COMPLETADA', 'CONFIRMADA', 'EVALUADO'].includes(
      String(this.value()),
    );
  }
}
