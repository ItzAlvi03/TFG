import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  mostrar: boolean = true;
  mensaje: string = "Error al iniciar sesion";
  alerta: boolean = false;
  inputNombre: String = "";
  inputContrasenia: String = "";
  rememberMe: boolean = false;

  constructor(private service: ApiService, private router: Router) {}

  ngOnInit() {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    this.inputNombre = username as String;
    this.inputContrasenia = password as String;
    if (username && password) {
      this.rememberMe = true;
    }
  }
  
  async iniciarSesion() {
    if(this.inputNombre.length >= 5){
      if(this.inputContrasenia.length >= 8){
        const user = {
          username: this.inputNombre as string,
          password: this.inputContrasenia as string
        }
        try {
          const response = await this.service.userLogin(user).toPromise();
          if(response.token){
            // Accion del remember me para recordar credenciales correctas
            if (this.rememberMe) {
              localStorage.setItem('username', user.username);
              localStorage.setItem('password', user.password);
            } else {
              localStorage.removeItem('username');
              localStorage.removeItem('password');
            }
            this.service.token.next(response.token as string);
            this.router.navigate(['/inicio',]);
          }
          
        } catch (error: any) {
          this.service.token.next('');
          if (error && error.error && error.error.mensaje) {
            this.mostrarMensaje(error.error.mensaje);
          } else {
            if (error.status === 500) {
            this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.')
          } else {
            this.mostrarMensaje('Error desconocido.');
          }
        }
        }
      }else{
        this.mostrarMensaje("La contraseña tiene que tener mínimo 8 carácteres.");
      }
    }
    else{
      this.mostrarMensaje("El nombre tiene que tener mínimo 5 carácteres.");
    }
  }

  mostrarMensaje(texto: string){
    this.mensaje = texto;
    this.alerta = true;
    setTimeout(() =>{
      this.alerta = false;
    },2500);
  }
}
