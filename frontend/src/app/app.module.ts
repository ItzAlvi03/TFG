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
import { RegisterComponent } from './Components/register/register.component';
import { ListaFacturasComponent } from './Components/pagina-inicio/lista-facturas/lista-facturas.component';
import { DiscountsComponent } from './Components/pagina-inicio/clientes/discounts/discounts.component';
import { InteractivePopUpComponent } from './Components/interactive-pop-up/interactive-pop-up.component';
import { ListaProductosComponent } from './Components/pagina-inicio/lista-productos/lista-productos.component';
import { MenuComponent } from './Components/pagina-inicio/menu/menu.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PaginaInicioComponent,
    DarAltaComponent,
    AlertComponent,
    InsertarPedidoComponent,
    SpinnerComponent,
    RegisterComponent,
    ListaFacturasComponent,
    DiscountsComponent,
    InteractivePopUpComponent,
    ListaProductosComponent,
    MenuComponent,
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
