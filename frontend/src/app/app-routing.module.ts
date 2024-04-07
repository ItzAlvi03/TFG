import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { PaginaInicioComponent } from './Components/pagina-inicio/pagina-inicio.component';

const routes: Routes = [
  { path: '', pathMatch: 'prefix', redirectTo: 'login'},
  { path: 'login', component: LoginComponent},
  { path: 'inicio', component: PaginaInicioComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
