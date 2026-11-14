import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Icon } from '../ui/icon';
export interface OpportunityQuery {
  query: string;
  location: string;
}
@Component({
  selector: 'tf-opportunity-search',
  imports: [ReactiveFormsModule, Icon],
  template: `<form
    class="opportunity-search"
    [class.vertical]="vertical()"
    [formGroup]="form"
    (ngSubmit)="search()"
  >
    <label class="query-control"
      ><tf-icon name="search" /><span class="sr-only">Puesto, empresa o palabra clave</span
      ><input
        formControlName="query"
        placeholder="Puesto, empresa o palabra clave"
        maxlength="150" /></label
    ><label class="location-control"
      ><tf-icon name="pin" /><span class="sr-only">Lugar de trabajo</span
      ><select formControlName="location">
        <option value="">Todo el Perú</option>
        <option>Lima</option>
        <option>Arequipa</option>
        <option>Trujillo</option>
        <option>Cusco</option>
      </select></label
    ><button class="btn primary" type="submit">Buscar prácticas <tf-icon name="arrow" /></button>
  </form>`,
  styleUrl: './opportunity-search.scss',
})
export class OpportunitySearch {
  readonly vertical = input(false);
  readonly searched = output<OpportunityQuery>();
  readonly form = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true }),
  });
  search() {
    const value = this.form.getRawValue();
    this.searched.emit({ query: value.query.trim(), location: value.location });
  }
}
