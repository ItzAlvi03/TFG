import { Component } from '@angular/core';
import { Client } from 'src/app/Interfaces/client';
import { Product } from 'src/app/Interfaces/product';
import { ProductsDiscount } from 'src/app/Interfaces/products-discount';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.css']
})
export class DiscountsComponent {
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
 * resultados - boolean - Determinates if there are clients on the last search
 */
resultados: boolean = false;
/**
* discountOptions - string[] - Array of the 2 options of client's discount
*/
discountOptions: string[] = ['Añadir', 'Borrar'];
/**
* discountOption - string - Option of the discount
*/
discountOption: string = this.discountOptions[0];
/**
* products - Product[] - Array of products
*/
products: any[] = [];
/**
* finalProduct - Product - The product to add the new discount
*/
finalProduct!: Product;
/**
 * mostrar - number - Show one type of result or the other type(add or remove type results)
 */
mostrar: number = 1;
/**
 * showPopUp - number - Show the pop up if number is different of 0 and set the pop up type
 */
showPopUp: number = 0;
/**
 * mensaje - string - Message to show on the pop up
 */
mensaje: string = "";
/**
 * discountNumber - number - The percentage that client will have on the product
 */
discountNumber: number = 0;

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

/**
 * Select the client and search all the products
 * @param client 
 */
async selectClient(client: Client) {
  this.resultados = false;
  this.clientSelected = true;
  this.client = client;
  this.mostrar = 1;
  this.discountOption = this.discountOptions[0];

  const product = {
    type: this.clientType,
    token: localStorage.getItem("token") || ""
  }
  this.service.spinnerMessage.next("Buscando productos para " + this.client.type + "...");
  this.service.spinner.next(true);

  try {
    this.products = [] as Product[]
    const response = await this.service.getAllProducts(product).toPromise();
    if(response && response.products){
      this.products = response.products;
      if(this.products.length > 0){
        this.resultados = true;
      } else {
        this.resultados = false;
      }
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

async changeOption(){
  this.resultados = false;
  if(this.discountOption == this.discountOptions[0]){
    this.mostrar = 1;
    await this.selectClient(this.client);
  } else{
    this.products = [] as ProductsDiscount[];
    this.mostrar = 2;
    const client = {
      name: this.client.name,
      email: this.client.email,
      type: this.client.type,
      token: localStorage.getItem("token") || ""
    }
    this.service.spinnerMessage.next("Buscando productos con descuento del cliente...");
    this.service.spinner.next(true);
  
    try {
      const response = await this.service.getDiscountProducts(client).toPromise();
      if(response && response.products){
        this.products = response.products;
        if(this.products.length > 0){
          this.resultados = true;
        } else {
          this.resultados = false;
        }
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
}

discountAction(confirm: boolean, num: number){
  this.showPopUp = 0;
  this.mostrar = num;
  this.discountNumber = Math.round(this.discountNumber * 100) / 100;
  if(num == 1 && confirm){
    // Update or create a discount for the user in the selected product
    if(this.discountNumber <= 0){
      this.mostrarMensaje("El descuento no puede ser menor o igual a 0.", false);
    } else if(this.discountNumber > 100){
      this.mostrarMensaje("El descuento no puede ser mayor que 100.", false);
    } else{
      this.addProductDiscount();
    }
  } else if(confirm){
    // Delete the discount of the user's product
    this.deleteDiscount();
  }
}

async addProductDiscount(){
  this.resultados = false;
  const data = {
    name: this.client.name,
    email: this.client.email,
    type: this.client.type,
    product: this.finalProduct,
    discount: this.discountNumber,
    token: localStorage.getItem("token") || ""
  }
  this.service.spinnerMessage.next("Agregando descuento al producto...");
  this.service.spinner.next(true);

  try {
    const response = await this.service.addProductDiscount(data).toPromise();
    this.mostrarMensaje("Descuento agregado con exito.", true);
  } catch (error: any) {
    this.resultados = false;
    if (error && error.error && error.error.error) {
      this.mostrarMensaje(error.error.error, false);
    } else {
      this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false);
    }
  }
  this.resultados = true;
  this.service.spinner.next(false);
}

async deleteDiscount(){
  this.resultados = false;
  const data = {
    name: this.client.name,
    email: this.client.email,
    type: this.client.type,
    product: this.finalProduct,
    token: localStorage.getItem("token") || ""
  }
  this.service.spinnerMessage.next("Eliminando el descuento seleccionado...");
  this.service.spinner.next(true);

  try {
    const response = await this.service.deleteDiscount(data).toPromise();
    // Refresh de array of products
    const index = this.products.findIndex(item => item === this.finalProduct);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
    this.mostrarMensaje("Descuento borrado con exito.", true);
  } catch (error: any) {
    this.resultados = false;
    if (error && error.error && error.error.error) {
      this.mostrarMensaje(error.error.error, false);
    } else {
      this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false);
    }
  }
  this.resultados = true;
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
