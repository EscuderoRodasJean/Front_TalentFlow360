import { Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
export type FormValue=Record<string,string|number|boolean|null>;
export interface Field {key:string;label:string;type?:string;required?:boolean;min?:number;max?:number;minLength?:number;maxLength?:number;options?:readonly string[];value?:string|number|boolean;hint?:string;}
export function dateOrder(start:string,end:string):ValidatorFn{return group=>{const a=group.get(start)?.value,b=group.get(end)?.value;return a&&b&&b<a?{dateOrder:true}:null;};}
@Component({selector:'tf-data-form',imports:[ReactiveFormsModule],template:`
<form [formGroup]="form()" (ngSubmit)="submit()" novalidate class="data-form">
 @for(f of fields();track f.key){<div class="field" [class.full]="f.type==='textarea'">
 <label [for]="prefix()+'-'+f.key">{{f.label}} @if(f.required){<span aria-hidden="true">*</span>}</label>
 @if(f.options){<select [id]="prefix()+'-'+f.key" [formControlName]="f.key" [attr.aria-describedby]="prefix()+'-'+f.key+'-help'"><option value="">Selecciona una opción</option>@for(o of f.options;track o){<option [value]="o">{{o.replaceAll('_',' ')}}</option>}</select>}
 @else if(f.type==='textarea'){<textarea [id]="prefix()+'-'+f.key" [formControlName]="f.key" rows="4" [attr.aria-describedby]="prefix()+'-'+f.key+'-help'"></textarea>}
 @else if(f.type==='checkbox'){<input [id]="prefix()+'-'+f.key" type="checkbox" [formControlName]="f.key"/>}
 @else{<input [id]="prefix()+'-'+f.key" [type]="f.type||'text'" [formControlName]="f.key" [attr.min]="f.min??null" [attr.max]="f.max??null" [attr.autocomplete]="f.type==='password'?'current-password':f.key==='email'?'email':'off'" [attr.aria-describedby]="prefix()+'-'+f.key+'-help'" [attr.aria-invalid]="invalid(f.key)"/>}
 <small [id]="prefix()+'-'+f.key+'-help'" [class.invalid]="invalid(f.key)">{{invalid(f.key)?message(f):f.hint||''}}</small>
 </div>}
 @if(form().hasError('dateOrder')){<p class="invalid full" role="alert">La fecha de fin debe ser posterior a la de inicio.</p>}
 <div class="full form-actions"><button class="btn primary" type="submit" [disabled]="busy()">{{busy()?'Guardando…':label()}}</button></div>
</form>`})
export class DataForm {
 readonly fields=input.required<readonly Field[]>();readonly values=input<FormValue>({});readonly busy=input(false);readonly label=input('Guardar');readonly prefix=input('form');readonly submitted=output<FormValue>();
 readonly form=signal(new FormGroup<Record<string,FormControl<string|number|boolean|null>>>({}));
 constructor(){effect(()=>{const fields=this.fields(),values=this.values(),controls:Record<string,FormControl<string|number|boolean|null>>={};for(const f of fields){const validators:ValidatorFn[]=[];if(f.required)validators.push(Validators.required);if(f.required&&f.type!=='checkbox'&&f.type!=='number')validators.push(Validators.pattern(/\S/));if(f.type==='email')validators.push(Validators.email);if(f.min!==undefined)validators.push(Validators.min(f.min));if(f.max!==undefined)validators.push(Validators.max(f.max));if(f.minLength)validators.push(Validators.minLength(f.minLength));if(f.maxLength)validators.push(Validators.maxLength(f.maxLength));if(f.type==='url')validators.push(Validators.pattern(/^$|^https?:\/\/[^\s]+$/));controls[f.key]=new FormControl(values[f.key]??f.value??(f.type==='checkbox'?false:''),validators);}const form=new FormGroup(controls);const start=fields.find(x=>x.key==='fechaInicio'||x.key==='fechaHoraInicio');const end=fields.find(x=>x.key==='fechaFin'||x.key==='fechaHoraFin');if(start&&end)form.addValidators(dateOrder(start.key,end.key));this.form.set(form);});}
 invalid(key:string):boolean{const c=this.form().controls[key];return c.invalid&&c.touched;}
 message(f:Field):string{const e=this.form().controls[f.key].errors;return e?.['required']?'Este campo es obligatorio.':e?.['email']?'Introduce un correo válido.':e?.['minlength']?'Usa al menos '+f.minLength+' caracteres.':e?.['maxlength']?'Usa como máximo '+f.maxLength+' caracteres.':e?.['min']?'El mínimo es '+f.min+'.':e?.['max']?'El máximo es '+f.max+'.':'Revisa el formato de este campo.';}
 submit():void{this.form().markAllAsTouched();if(this.form().valid&&!this.busy())this.submitted.emit(this.form().getRawValue());}
}
