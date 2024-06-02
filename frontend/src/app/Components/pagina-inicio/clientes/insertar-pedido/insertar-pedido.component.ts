import { Component } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';
import { Client } from 'src/app/Interfaces/client';

@Component({
  selector: 'app-insertar-pedido',
  templateUrl: './insertar-pedido.component.html',
  styleUrls: ['./insertar-pedido.component.css']
})
export class InsertarPedidoComponent {
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
   * clients - Clients[] - Array of clients
   */
  clients: Client[] = [];
  /**
   * client - Clients - The selected client to use him
   */
  client!: Client;
  /**
   * clientSelected - boolean - Determinates if is a client selected
   */
  clientSelected: boolean = false;
  /**
   * resultados - boolean - Determinates if there are clients on the last search
   */
  resultados: boolean = false;

  /**
   * 
   * @param service - ApiService - Angular Service to use the API.
   */
  constructor(private service: ApiService) {}
  
  /**
   * Method that search clients
   */
  async buscarClientes() {
    const client = {
      name: this.name,
      type: this.clientType,
      token: localStorage.getItem('token') || ""
    }
    try {
      const response = await this.service.searchAllClients(client).toPromise();
      if(response && response.clients){
        this.clients = response.clients;
        if(this.clients.length > 0) this.resultados = true;
        else this.resultados = false
      }
      
    } catch (error: any) {
      this.resultados = false;
      if (error && error.error && error.error.error) {
        this.mostrarMensaje(error.error.error, false);
      } else {
          this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false)
      }
    }
  }
  
  selectClient(client: Client){
    this.resultados = false;
    this.clientSelected = true;
    this.client = client;
  }

  cambiaValor(id: number) {
    let inputValue = "";
    let maxLength = 0;
    let minLength = 0;

    // switch(id){
    //   case 1:
    //     inputValue = this.name;
    //     maxLength = 30;
    //     minLength = 5;
    //     break;
    //   case 3:
    //     inputValue = this.cif;
    //     maxLength = 9;
    //     minLength = 8;
    //     break;
    //   case 4:
    //     inputValue = this.address;
    //     maxLength = 50;
    //     minLength = 5;
    //     break;
    //   case 5:
    //     inputValue = this.bankAccount;
    //     maxLength = 24;
    //     minLength = 13;
    //     break;
    // }

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
