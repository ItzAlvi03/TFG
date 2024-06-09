import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
/**
   * mostrar - boolean - Hidde or see the password
   */
mostrar: boolean = true;
/**
 * inputNombre - String - Var that contains the value of the username
 */
inputNombre: String = "";
/**
 * inputContrasenia - String - Var that contains the value of the password
 */
inputContrasenia: String = "";
/**
   * clientTypes - string[] - Array de string con los tipos de usuarios que existen
   */
userTypes: string[] = ['Trabajador', 'Encargado'];
/**
 * clientType - string - El tipo de usuario que será al crearlo
 */
userType: string = this.userTypes[0];

/**
 * 
 * @param service - ApiService - Angular Service to use the API.
 * @param router - Router - Angular Class that allows the user to move through the different components.
 */
constructor(private service: ApiService, private router: Router) {}

/**
 * Metodo para crear la cuenta del usuario
 */
async crearCuenta() {
  if(this.inputNombre.length >= 5){
    if(this.inputNombre.length <= 30){
      if(this.inputContrasenia.length <= 16){
        if(this.inputContrasenia.length >= 6){
          this.service.spinnerMessage.next("Creando cuenta...");
          this.service.spinner.next(true);
          const user = {
            username: this.inputNombre as string,
            password: this.inputContrasenia as string,
            type: this.userType as string
          }
          try {
            const response = await this.service.createAccount(user).toPromise();
            this.mostrarMensaje("Cuenta creada con exito.", true);
            this.router.navigate(['/login']);
          } catch (error: any) {
            if (error && error.error && error.error.error) {
              this.mostrarMensaje(error.error.error, false);
            } else {
              this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false)
            }
          }
          this.service.spinner.next(false);
        }else{
          this.mostrarMensaje("La contraseña tiene que tener mínimo 6 carácteres.", false);
        }
      } else{
        this.mostrarMensaje("La contraseña no puede tener más de 16 carácteres.", false);
      }
    } else{
      this.mostrarMensaje("El nombre no puede tener más de 30 carácteres.", false);
    }
  } else{
    this.mostrarMensaje("El nombre tiene que tener mínimo 5 carácteres.", false);
  }
}

/**
 * Method to show the pop up with a specific message
 * 
 * @param texto - string - message to show on the pop up
 */
mostrarMensaje(texto: string, correcto: boolean){
  this.service.correct.next(correcto);
  this.service.message.next(texto);
  this.service.alert.next(true);
  setTimeout(() =>{
    this.service.alert.next(false);
  },3000);
}
}
