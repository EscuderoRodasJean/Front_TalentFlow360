import { Routes } from '@angular/router';
import { MANAGERS, STAFF, RECRUITERS } from './core/auth/auth-store';
import { authGuard, roleGuard } from './core/auth/auth-guards';
export const routes: Routes = [
  {path:'',loadComponent:()=>import('./features/welcome/welcome').then(m=>m.Welcome),title:'TalentFlow360 · Tu siguiente paso'},
  {path:'ingresar',loadComponent:()=>import('./features/auth/auth-page').then(m=>m.AuthPage),title:'Ingresar · TalentFlow360'},
  {path:'registro',loadComponent:()=>import('./features/auth/auth-page').then(m=>m.AuthPage),data:{register:true},title:'Crear cuenta · TalentFlow360'},
  {path:'app',canActivate:[authGuard],canActivateChild:[roleGuard],loadComponent:()=>import('./layout/shell').then(m=>m.Shell),children:[
    {path:'',pathMatch:'full',redirectTo:'inicio'},
    {path:'inicio',loadComponent:()=>import('./features/home/home').then(m=>m.Home),title:'Mi espacio · TalentFlow360'},
    {path:'vacantes',loadComponent:()=>import('./features/vacancies/vacancies').then(m=>m.Vacancies),title:'Oportunidades · TalentFlow360'},
    {path:'vacantes/nueva',loadComponent:()=>import('./features/vacancies/vacancy-create').then(m=>m.VacancyCreate),data:{roles:RECRUITERS},title:'Crear vacante'},
    {path:'vacantes/:id',loadComponent:()=>import('./features/vacancies/vacancy-detail').then(m=>m.VacancyDetail),title:'Detalle de oportunidad'},
    {path:'perfil',loadComponent:()=>import('./features/profile/profile').then(m=>m.Profile),data:{roles:['POSTULANTE']},title:'Mi perfil'},
    {path:'postulaciones',loadComponent:()=>import('./features/applications/applications').then(m=>m.Applications),title:'Postulaciones'},
    {path:'postulaciones/:id',loadComponent:()=>import('./features/applications/application-detail').then(m=>m.ApplicationDetail),title:'Seguimiento y matching'},
    {path:'entrevistas',loadComponent:()=>import('./features/interviews/interviews').then(m=>m.Interviews),data:{roles:STAFF},title:'Agenda de entrevistas'},
    {path:'evaluaciones',loadComponent:()=>import('./features/evaluations/evaluations').then(m=>m.Evaluations),data:{roles:['EVALUADOR','COORDINADOR','ADMINISTRADOR']},title:'Evaluaciones'},
    {path:'indicadores',loadComponent:()=>import('./features/dashboard/dashboard').then(m=>m.Dashboard),data:{roles:MANAGERS},title:'Indicadores y trazabilidad'},
    {path:'usuarios',loadComponent:()=>import('./features/users/users').then(m=>m.Users),data:{roles:MANAGERS},title:'Equipo y accesos'},
  ]},
  {path:'sin-acceso',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),data:{forbidden:true},title:'Acceso restringido'},
  {path:'**',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),title:'Página no encontrada'},
];
