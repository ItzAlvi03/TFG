import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Components/login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PaginaInicioComponent } from './Components/pagina-inicio/pagina-inicio.component';
import { DarAltaComponent } from './Components/pagina-inicio/clientes/dar-alta/dar-alta.component';
import { AuthGuard } from './auth.guard';
import { ApiService } from './Services/api.service';
import { TokenInterceptor } from './Interceptor/token.interceptor';
import { AlertComponent } from './Components/alert/alert.component';
import { InsertarPedidoComponent } from './Components/pagina-inicio/clientes/insertar-pedido/insertar-pedido.component';
import { SpinnerComponent } from './Components/spinner/spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PaginaInicioComponent,
    DarAltaComponent,
    AlertComponent,
    InsertarPedidoComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule 
  ],
  providers: [
    AuthGuard,
    ApiService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
