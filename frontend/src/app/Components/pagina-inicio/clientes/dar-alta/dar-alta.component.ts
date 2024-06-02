import { Component } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-dar-alta',
  templateUrl: './dar-alta.component.html',
  styleUrls: ['./dar-alta.component.css']
})
export class DarAltaComponent {
  /**
   * clientTypes - string[] - Array de string con los tipos de clientes que existen
   */
  clientTypes: string[] = ['Particular', 'Empresa'];
  /**
   * clientType - string - El tipo de cliente que será al insertarlo
   */
  clientType: string = this.clientTypes[0];
  /**
   * name - string - client's name
   */
  name: string = "";
  /**
   * email - string - client's email
   */
  email: string = "";
  /**
   * validEmail - RegExp - Contains the specific format of emails
   */
  private validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
  /**
   * cif - string - client's NIF/CIF
   */
  cif: string = "";
  /**
   * address - string - client's address
   */
  address: string = "";
  /**
   * bankAccount - string - client's bank account
   */
  bankAccount: string = "";

  /**
   * 
   * @param service - ApiService - Angular Service to use the API.
   */
  constructor(private service: ApiService) {}
  
  /**
   * Method that insert the new client
   */
  async insertClient() {
    if(this.comprobarDatos()){
      const client = {
        name: this.name,
        email: this.email,
        cif: this.cif,
        address: this.address,
        type: this.clientType,
        bank_account: this.bankAccount,
        token: localStorage.getItem('token') || ""
      }
      try {
        const response = await this.service.insertClient(client).toPromise();
        if(response){
          this.mostrarMensaje("Cliente insertado con exito.", true);
        }
        
      } catch (error: any) {
        if (error && error.error && error.error.error) {
          this.mostrarMensaje(error.error.error, false);
        } else {
            this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false)
        }
      }
    }
  }

  comprobarDatos(): boolean{
    // Cambiamos todos los espacios por 1 solo en caso de que haya más de 1 espacio entre palabra y palabra
    this.name = this.name.replace(/\s+/g, ' ').trim();
    this.address = this.address.replace(/\s+/g, ' ').trim();
    var continuar = true;
    // Si la clase .border-red está activa significa que uno de los 5 campos está mal
    // o si no existen 5 clases .border-blue significa que no todos los campos están rellenados
    if(this.name.length === 0 || this.email.length === 0 || this.cif.length === 0 || this.address.length === 0 || this.bankAccount.length === 0){
      continuar = false;
      this.mostrarMensaje("Faltan datos por rellenar.", false);
    } else if(document.querySelector('.border-red')){
      if(this.name.length < 5){
        document.getElementById('input1')?.classList.add("border-red")
        document.getElementById('input1')?.classList.remove("border-blue")
      }
      if(this.address.length < 5){
        document.getElementById('input4')?.classList.add("border-red")
        document.getElementById('input4')?.classList.remove("border-blue")
      }

      // Sabemos que no puede continuar ya que algo está mal y buscamos cual está mal para mostrar un mensaje
      this.mensajesError(document.querySelector('.border-red')?.id || '');
      continuar = false;
    }
    return continuar;
  }

  mensajesError(id: string){
    switch(id){
      case "input1":
        if(this.name.length < 5) this.mostrarMensaje("El nombre debe tener al menos 5 carácteres.", false);
        else this.mostrarMensaje("El nombre no puede tener más de 30 carácteres.", false);
        break;
      case "input2":
        if(this.email.indexOf(" ") !== -1) this.mostrarMensaje("El email no puede tener espacios.", false);
        else if(this.email.length == 0) this.mostrarMensaje("El email no puede estar vacío.", false);
        else if(this.email.length > 50) this.mostrarMensaje("El email no puede tener más de 50 carácteres.", false);
        else this.mostrarMensaje("El formato del email es erróneo.", false);
        break;
      case "input3":
        if(this.cif.indexOf(" ") !== -1) this.mostrarMensaje("El CIF no puede tener espacios.", false);
        else if(this.cif.length < 8) this.mostrarMensaje("El CIF es muy pequeño.", false);
        else this.mostrarMensaje("El CIF es demasiado grande.", false)
        break;
      case "input4":
        if(this.address.length < 5) this.mostrarMensaje("La dirección es muy corta.", false);
        else if(this.address.length > 50) this.mostrarMensaje("La dirección es demasiado grande.", false);
        break;
      case "input5":
        if(this.bankAccount.indexOf(" ") !== -1) this.mostrarMensaje("El número de cuenta bancaria no puede tener espacios.", false);
        else if(this.bankAccount.length < 13) this.mostrarMensaje("El número de cuenta de banco es muy pequeño.", false);
        else this.mostrarMensaje("El número de cuenta de banco es demasiado grande.", false);
        break;
      default:
        this.mostrarMensaje("Alguno de los datos está mal.", false);
        break;
    }
  }

  cambiaValor(id: number) {
    let inputValue = "";
    let maxLength = 0;
    let minLength = 0;

    switch(id){
      case 1:
        inputValue = this.name;
        maxLength = 30;
        minLength = 5;
        break;
      case 3:
        inputValue = this.cif;
        maxLength = 9;
        minLength = 8;
        break;
      case 4:
        inputValue = this.address;
        maxLength = 50;
        minLength = 5;
        break;
      case 5:
        inputValue = this.bankAccount;
        maxLength = 24;
        minLength = 13;
        break;
    }

    const input = document.getElementById('input' + id) as HTMLInputElement;
    // Si se ha pasado del límite se recorta el length
    if(inputValue.length > maxLength || inputValue.length < minLength){
      input.classList.remove('border-blue');
      input.classList.add('border-red');
    } else{
      input.classList.remove('border-red');
      input.classList.add('border-blue');
    }
  }

  controlarEmail(){
    const input = document.getElementById('input2') as HTMLInputElement;
    var error = false;
    // Comprobaciones del length y validar email
    try{
      if(this.email.length > 50) error = true;
      else if(this.email.indexOf(" ") !== -1) error = true;
      else if(!this.validEmail.test(this.email)) error = true;
    } catch(e){
      error = true;
    }

    if(error){
      input.classList.remove('border-blue');
      input.classList.add('border-red');
    }
    else{
      input.classList.remove('border-red');
      input.classList.add('border-blue');
    }
  }

  pierdeFoco(id: number) {
    var inputValue = null;
    if(id == 2) {
      this.controlarEmail();
    }
    else{
      switch(id){
        case 1:
          inputValue = this.name;
          break;
        case 3:
          inputValue = this.cif;
          break;
        case 4:
          inputValue = this.address;
          break;
        case 5:
          inputValue = this.bankAccount;
          break;
      }
      const input = document.getElementById('input' + id) as HTMLInputElement;
      if (inputValue?.length === 0) input.classList.add("border-red");
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
