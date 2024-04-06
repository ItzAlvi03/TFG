import { AfterViewInit, Component } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent{
  mostrar: boolean = true;
  mensaje: string = "Error al iniciar sesion";
  alerta: boolean = false;
  inputNombre: String = "";
  inputContrasenia: String = "";

  constructor(private service: ApiService) {}
  
  async iniciarSesion() {
    if(this.inputNombre.length >= 5){
      if(this.inputContrasenia.length >= 8){
        const user = {
          username: this.inputNombre as string,
          password: this.inputContrasenia as string
        }
        try {
          const response = await this.service.userLogin(user).toPromise();
          
        } catch (error: any) {
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
