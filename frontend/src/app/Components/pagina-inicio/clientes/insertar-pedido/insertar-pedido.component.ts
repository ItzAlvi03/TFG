import { Component } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';
import { Client } from 'src/app/Interfaces/client';
import { Products } from 'src/app/Interfaces/products';
import { Product } from 'src/app/Interfaces/product';

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
   * products - Product[] - Array of products
   */
  products: Product[] = [];
  /**
   * resultados - boolean - Determinates if there are clients on the last search
   */
  resultados: boolean = false;
  /**
   * avaliablePackagings - string[] - Array of avaliables packagings of products in DB
   */
  avaliablePackagings!: string[];
  /**
   * avaliableNames - string[] - Array of avaliables names of products in DB
   */
  avaliableNames!: string[];
  /**
   * productName - string - The name of the product selected
   */
  productName: string = "";
  /**
   * productPackaging - string - The packaging of the product selected
   */
  productPackaging: string = "";
  /**
   * finalProducts - Products - All the products selected
   */
  finalProducts: Products[] = [];
  /**
   * insertProducts - boolean - Allows the button action to insert the order
   */
  insertProducts: boolean = false;

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
    this.insertProducts = false;
    this.client = client;
    this.productName = "";
    this.productPackaging = "";
    this.finalProducts = [];

    const product = {
      type: this.clientType,
      token: localStorage.getItem("token") || ""
    }
    this.service.spinnerMessage.next("Buscando productos para " + this.client.type + "...");
    this.service.spinner.next(true);

    try {
      const response = await this.service.getAllProducts(product).toPromise();
      if(response && response.products){
        this.products = response.products;
        if(this.products.length > 0){
          this.avaliableNames = [];
          this.avaliablePackagings = [];
          for(let product of this.products){
            // Push new names and packaging to the avaliables values to choose on the selects
            if(!this.avaliableNames.includes(product.name)) this.avaliableNames.push(product.name);
            if(!this.avaliablePackagings.includes(product.packaging)) this.avaliablePackagings.push(product.packaging);
          }
          this.finalProducts = [];
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

  onProductChange(num: number, event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if(num == 1){
      this.productName = selectedValue;
      const filteredProducts = this.products.filter(product => product.name === this.productName);
      const uniquePackagings = new Set(filteredProducts.map(product => product.packaging));
      this.avaliablePackagings = Array.from(uniquePackagings);
    } else{
      this.productPackaging = selectedValue;
      const filteredProducts = this.products.filter(product => product.packaging === this.productPackaging);
      const uniqueNames = new Set(filteredProducts.map(product => product.name));
      this.avaliableNames = Array.from(uniqueNames);
    }
  }

  resetFilters(){
    if(this.finalProducts.length > 0){
      this.insertProducts = true;
    } else{
      this.insertProducts = false;
    }

    for(let product of this.products){
      if(!this.avaliableNames.includes(product.name)) this.avaliableNames.push(product.name);
      if(!this.avaliablePackagings.includes(product.packaging)) this.avaliablePackagings.push(product.packaging);
    }

    this.productName = "";
    this.productPackaging = "";
  }

  insertProduct(){
    if(this.productName !== "" && this.productPackaging !== ""){
      const arr_products = this.products.filter(product => product.name === this.productName);
      const index = arr_products.filter(product => product.packaging === this.productPackaging)[0];

      this.finalProducts.push({
        name: this.productName,
        packaging: this.productPackaging,
        type: this.clientType,
        quantity: 1,
        price: index.price
      });
      
      // Delete the names and packagings of the selected product
      const position = this.products.indexOf(index);
      this.products.splice(position, 1);

      // If there is no more options for the product name then delete it from avaliables
      if(this.products.filter(product => product.name === this.productName).length == 0){
        const index2 = this.avaliableNames.indexOf(this.productName);
        this.avaliableNames.splice(index2, 1);
      }
      // If there is no more options for the product packaging then delete it from avaliables
      if(this.products.filter(product => product.packaging === this.productPackaging).length == 0){
        const index2 = this.avaliablePackagings.indexOf(this.productPackaging);
        this.avaliablePackagings.splice(index2, 1);
      }

      this.resetFilters();
    }
  }

  deleteProduct(product: Products){
    const index = this.finalProducts.indexOf(product);
    const newProduct = {
      name: product.name,
      packaging: product.packaging,
      price: product.price
    }
    this.products.push(newProduct);
    this.finalProducts.splice(index, 1);
    this.resetFilters();
  }

  async insertOrder(){
    if(this.finalProducts.length > 0){
      let totalPrice = 0;
      for(let product of this.finalProducts){
        totalPrice += (product.price * product.quantity)
      }

      const order = {
        products: this.finalProducts,
        total: totalPrice,
        client: this.client,
        token: localStorage.getItem('token') || ""
      }

      this.service.spinnerMessage.next("Insertando pedido...");
      this.service.spinner.next(true);
  
      try {
        const response = await this.service.insertOrder(order).toPromise();
        // If all its ok, reset all the values and restart all
        if(response){
          this.resultados = false;
          this.clientSelected = false;
          this.avaliableNames = [];
          this.avaliablePackagings = [];
          this.productName = "";
          this.productPackaging = "";
          this.finalProducts = [];
          this.products = [];
          this.mostrarMensaje("Pedido insertado correctamente.", true);
        }
      } catch (error: any) {
        if (error && error.error && error.error.error) {
          this.mostrarMensaje(error.error.error, false);
        } else {
          this.mostrarMensaje('Ha ocurrido un error en el servidor, inténtelo de nuevo.', false);
        }
      }
      this.service.spinner.next(false);
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
