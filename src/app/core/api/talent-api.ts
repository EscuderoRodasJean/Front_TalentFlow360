import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client';
import * as M from './models';
@Injectable({providedIn:'root'})
export class TalentApi {
 readonly client=inject(ApiClient);
 login(body:{email:string;password:string}){return this.client.post<M.AuthResponseDTO>('/auth/login',body);}
 register(body:unknown){return this.client.post<M.UsuarioDTO>('/auth/registro',body);}
 vacancies(){return this.client.get<M.VacanteDTO[]>('/vacantes');}
 vacancy(id:number){return this.client.get<M.VacanteDTO>('/vacantes/'+id);}
 profile(userId:number){return this.client.get<M.PostulanteDTO>('/postulantes/usuario/'+userId);}
 applications(scope:'postulante'|'vacante'|'evaluador',id:number){return this.client.get<M.PostulacionDTO[]>('/postulaciones/'+scope+'/'+id);}
 application(id:number){return this.client.get<M.PostulacionDTO>('/postulaciones/'+id);}
 history(id:number){return this.client.get<M.HistorialEstadoDTO[]>('/postulaciones/'+id+'/historial');}
 matching(id:number){return this.client.get<M.DetalleMatchingDTO[]>('/postulaciones/'+id+'/matching');}
 feedback(id:number,visible:boolean){return this.client.get<M.RetroalimentacionDTO[]>('/evaluaciones/retroalimentacion/postulacion/'+id+(visible?'/visible':''));}
 dashboard(){return this.client.get<M.DashboardDTO>('/dashboard');}
}
