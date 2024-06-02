import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
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
   * rememberMe - boolean - The value of the checkbox "remember me"
   */
  rememberMe: boolean = false;

  /**
   * 
   * @param service - ApiService - Angular Service to use the API.
   * @param router - Router - Angular Class that allows the user to move through the different components.
   */
  constructor(private service: ApiService, private router: Router) {}

  /**
   * Method that executes before the view is loaded.
   * Check if the user has remember me option to autocomplete the inputs.
   */
  ngOnInit() {
    localStorage.removeItem("token");
    const username = localStorage.getItem('username') || null;
    const password = localStorage.getItem('password') || null;
    this.inputNombre = username as String;
    this.inputContrasenia = password as String;
    if (username && password) {
      this.rememberMe = true;
    }
  }
  
  /**
   * Metodo para comprobar las credenciales e iniciar sesión
   */
  async iniciarSesion() {
    if(this.inputNombre.length >= 5){
      if(this.inputContrasenia.length >= 6){
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
            localStorage.setItem("token", response.token);
            this.router.navigate(['/home']);
          }
          
        } catch (error: any) {
          if (error && error.error && error.error.error) {
            this.mostrarMensaje(error.error.error, false);
          } else {
            this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false)
          }
        }
      }else{
        this.mostrarMensaje("La contraseña tiene que tener mínimo 6 carácteres.", false);
      }
    }
    else{
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
