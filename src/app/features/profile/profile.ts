import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AuthStore } from '../../core/auth/auth-store';
import { TalentApi } from '../../core/api/talent-api';
import { PostulanteDTO } from '../../core/api/models';
import { errorMessage } from '../../core/api/http-interceptors';
import { NoticeStore } from '../../core/feedback/notice-store';
import { DataForm, FormValue } from '../../shared/forms/data-form';
import { contactFields, educationFields, experienceFields, skillFields } from '../../shared/forms/fields';
import { AsyncState } from '../../shared/ui/async-state';
@Component({imports:[DataForm,AsyncState],templateUrl:'./profile.html'})
export class Profile {
 private readonly api=inject(TalentApi);readonly auth=inject(AuthStore);private readonly notice=inject(NoticeStore);readonly profile=signal<PostulanteDTO|null>(null);readonly loading=signal(false);readonly busy=signal(false);readonly error=signal('');readonly actionError=signal('');readonly contactFields=contactFields;readonly educationFields=educationFields;readonly experienceFields=experienceFields;readonly skillFields=skillFields;readonly tab=signal('contacto');
 readonly values=signal<FormValue>({});
 constructor(){this.load();}
 load(){this.loading.set(true);this.error.set('');this.api.profile(this.auth.session()!.usuarioId!).pipe(finalize(()=>this.loading.set(false))).subscribe({next:p=>{this.profile.set(p);this.values.set({resumenProfesional:p.resumenProfesional??'',telefono:p.telefono??'',direccion:p.direccion??'',linkedinUrl:p.linkedinUrl??''});},error:e=>{if(e instanceof HttpErrorResponse&&e.status===404)this.profile.set(null);else this.error.set(errorMessage(e));}});}
 saveContact(v:FormValue){const p=this.profile();this.mutate(p?this.api.client.put('/postulantes/'+p.id,v):this.api.client.post('/postulantes/usuario/'+this.auth.session()!.usuarioId,v));}
 add(kind:string,v:FormValue){const p=this.profile();if(!p)return;const body={...v};for(const k of ['fechaFin'])if(body[k]==='')body[k]=null;this.mutate(this.api.client.post('/postulantes/'+p.id+'/'+kind,body));}
 private mutate(request:Observable<PostulanteDTO>){if(this.busy())return;this.busy.set(true);this.actionError.set('');request.pipe(finalize(()=>this.busy.set(false))).subscribe({next:p=>{this.profile.set(p);this.notice.show('Perfil actualizado. Tu completitud fue recalculada por el servidor.');},error:e=>this.actionError.set(errorMessage(e))});}
}
