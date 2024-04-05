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
          nombre: this.inputNombre as string,
          contrasenia: this.inputContrasenia as string
        }
        const response = await this.service.iniciarSesion(user).toPromise();
        console.log(response);
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
    },1500);
  }
}
