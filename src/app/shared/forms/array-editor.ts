import { Component, input, output, signal } from '@angular/core';
import { DataForm, Field, FormValue } from './data-form';
@Component({selector:'tf-array-editor',imports:[DataForm],template:`<div class="stack">@for(item of items();track $index){<div class="row between"><span>{{item['nombre']}} @if(item['pesoMatching']){ · Peso {{item['pesoMatching']}}} @if(item['puntaje']!==undefined){ · {{item['puntaje']}} / {{item['puntajeMaximo']}}}</span><button type="button" class="btn quiet" (click)="remove($index)" [attr.aria-label]="'Quitar '+item['nombre']">Quitar</button></div>}</div><details [open]="items().length===0"><summary>Agregar {{label()}}</summary><tf-data-form [prefix]="label()" [fields]="fields()" label="Agregar a la lista" (submitted)="add($event)"/></details>`})
export class ArrayEditor {
 readonly fields=input.required<readonly Field[]>();readonly label=input('requisito');readonly changed=output<FormValue[]>();readonly items=signal<FormValue[]>([]);
 add(item:FormValue){this.items.update(v=>[...v,item]);this.changed.emit(this.items());}
 remove(index:number){this.items.update(v=>v.filter((_,i)=>i!==index));this.changed.emit(this.items());}
}
