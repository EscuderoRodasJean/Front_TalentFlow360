import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth-guards';
export const routes: Routes = [
  {path:'',loadComponent:()=>import('./features/welcome/welcome').then(m=>m.Welcome),title:'TalentFlow360 · Tu siguiente paso'},
  {path:'ingresar',loadComponent:()=>import('./features/auth/auth-page').then(m=>m.AuthPage),title:'Ingresar · TalentFlow360'},
  {path:'registro',loadComponent:()=>import('./features/auth/auth-page').then(m=>m.AuthPage),data:{register:true},title:'Crear cuenta · TalentFlow360'},
  {path:'app',canActivate:[authGuard],canActivateChild:[roleGuard],loadComponent:()=>import('./layout/shell').then(m=>m.Shell),children:[
    {path:'',pathMatch:'full',redirectTo:'inicio'},
    {path:'inicio',loadComponent:()=>import('./features/home/home').then(m=>m.Home),title:'Mi espacio · TalentFlow360'},
  ]},
  {path:'sin-acceso',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),data:{forbidden:true},title:'Acceso restringido'},
  {path:'**',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),title:'Página no encontrada'},
];
