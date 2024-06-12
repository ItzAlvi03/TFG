import { Component } from '@angular/core';
import { Client } from 'src/app/Interfaces/client';
import { Invoices } from 'src/app/Interfaces/invoices';
import { Product } from 'src/app/Interfaces/product';
import { Products } from 'src/app/Interfaces/products';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-lista-facturas',
  templateUrl: './lista-facturas.component.html',
  styleUrls: ['./lista-facturas.component.css']
})
export class ListaFacturasComponent {
/**
* clientTypes - string[] - Array de string con los tipos de clientes que existen
*/
clientTypes: string[] = ['Particular', 'Empresa'];
/**
 * clientType - string - Type of client
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
 * orderTypes - string[] - Array of the 2 types of orders
 */
orderTypes: string[] = ['Pendiente', 'Pagado'];
/**
 * orderType - string - The type of order to search the invoices
 */
orderType: string = this.orderTypes[0];
/**
 * invoiceType - string - All the invoice's types searched
 */
invoiceType: string = this.orderTypes[0];
/**
 * invoices - Invoices[] - Array of all the client's invoices
 */
invoices!: Invoices[];
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
  this.service.spinnerMessage.next("Buscando clientes...");
  this.service.spinner.next(true);
  const client = {
    name: this.name,
    type: this.clientType,
    token: localStorage.getItem('token') || ""
  }
  try {
    const response = await this.service.searchAllClients(client).toPromise();
    if(response && response.clients){
      this.clients = response.clients;
      this.resultados = this.clients.length > 0;
    }
  } catch (error: any) {
    this.resultados = false;
    if (error && error.error && error.error.error) {
      this.mostrarMensaje(error.error.error, false);
    } else {
      this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false);
    }
  }
  this.service.spinner.next(false);
}

async selectClient(client: Client) {
  this.resultados = false;
  this.clientSelected = true;
  this.client = client;
  this.searchInvoices();
}

async searchInvoices(){
  this.invoiceType = this.orderType;
  const clientInvoices = {
    client_name: this.client.name,
    client_email: this.client.email,
    client_type: this.client.type,
    order_type: this.orderType,
    token: localStorage.getItem("token") || ""
  }
  this.service.spinnerMessage.next("Buscando facturas del cliente...");
  this.service.spinner.next(true);

  try {
    const response = await this.service.searchClientInvoices(clientInvoices).toPromise();
    if(response){
      this.invoices = response.invoices;
      if(this.invoices.length > 0){
        this.resultados = true;
      } else {
        this.resultados = false;
      }
    }
  } catch (error: any) {
    this.resultados = false;
    this.invoices = [];
    if (error && error.error && error.error.error) {
      this.mostrarMensaje(error.error.error, false);
    } else {
      this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false);
    }
  }
  this.service.spinner.next(false);
}

async changeInvoiceType(invoice: Invoices, index: number){
  const new_invoice = {
    date: invoice.date,
    type: this.invoiceType,
    new_type: invoice.type,
    client_name: this.client.name,
    client_email: this.client.email,
    client_type: this.client.type,
    token: localStorage.getItem("token") || ""
  }
  this.service.spinnerMessage.next("Cambiando estado factura...");
  this.service.spinner.next(true);

  try {
    const response = await this.service.changeInvoiceType(new_invoice).toPromise();
    // Refresh the invoices deleting the changed invoice
    this.invoices.splice(index, 1);
    this.mostrarMensaje("Factura actualizada correctamente.", true);
  } catch (error: any) {
    if (error && error.error && error.error.error) {
      this.mostrarMensaje(error.error.error, false);
    } else {
      this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false);
    }
  }
  this.service.spinner.next(false);
}

async downloadInvoice(invoice: Invoices){
  const data = {
    id: invoice.id,
    token: localStorage.getItem('token') || ""
  }
  this.service.spinnerMessage.next("Descargando factura...");
  this.service.spinner.next(true);

  try{
    const file = await this.service.downloadInvoice(data).toPromise();
    console.log(file)
    if(file){
      var url = window.URL.createObjectURL(file);
      var a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Factura_${invoice.date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch(error: any){
    if (error && error.error && error.error.error) {
      this.mostrarMensaje(error.error.error, false);
    } else {
      this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false);
    }
  }
  this.service.spinner.next(false);
}

cambiaValor(id: number) {
  let inputValue = "";
  let maxLength = 0;
  let minLength = 0;

  const input = document.getElementById('input' + id) as HTMLInputElement;
  if(inputValue.length > maxLength || inputValue.length < minLength){
    input.classList.remove('border-blue');
    input.classList.add('border-red');
  } else {
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
