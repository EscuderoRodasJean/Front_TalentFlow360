import { Component, input, output } from '@angular/core';
@Component({selector:'tf-async-state',template:`@if(loading()){<div class="state" role="status"><span class="loader"></span>Cargando información…</div>}@if(error()){<div class="state error" role="alert"><strong>No pudimos completar la consulta</strong><p>{{error()}}</p><button class="btn secondary" (click)="retry.emit()">Volver a intentar</button></div>}`})
export class AsyncState {readonly loading=input(false);readonly error=input('');readonly retry=output<void>();}
