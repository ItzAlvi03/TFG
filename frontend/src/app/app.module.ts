import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PaginaInicioComponent } from './Components/pagina-inicio/pagina-inicio.component';
import { DarAltaComponent } from './Components/pagina-inicio/clientes/dar-alta/dar-alta.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PaginaInicioComponent,
    DarAltaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
