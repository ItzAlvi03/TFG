import { Component } from '@angular/core';
import { Product } from 'src/app/Interfaces/product';
import { Products } from 'src/app/Interfaces/products';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.css']
})
export class ListaProductosComponent {
/**
* clientTypes - string[] - String array with all client's types in database
*/
clientTypes: string[] = ['Particular', 'Empresa'];
/**
 * clientType - string - Type of client
 */
clientType: string = "";
/**
* packagingTypes - string[] - String array with all product's packagings in database
*/
packagingTypes: string[] = ['Bolsa', 'Tapper'];
/**
 * packagingType - string - Packaging of the product
 */
packagingType: string = "";
/**
 * products - Products - All the products in database
 */
products: Products[] = [];
/**
 * filteredProducts - Products - All the products in database with filter
 */
filteredProducts: Products[] = [];
/**
 * selectProduct - Product - The selected product before modified it
 */
selectProduct!: Product;
/**
 * showPopUp - boolean - Hide or show the pop up function
 */
showPopUp: boolean = false;
/**
 * mensaje - boolean - Message for the pop up
 */
mensaje: string = "";
/**
 * finalPrice - number - The final price for the product
 */
finalPrice: number = 0;
/**
 * rol - string - The user's rol
 */
rol: string = "";
/**
 * 
 * @param service - ApiService - Angular Service to use the API.
 */
constructor(private service: ApiService) {}

  /**
   * Method that executes before the view is completed.
   * Get the rol and get all products from database
   */
  ngOnInit(): void {
    this.rol = this.service.rol.value.toLowerCase();
    this.getAllProducts();
  }

/**
 * Method that get all the products in the database
 */
async getAllProducts() {
  const data = {
    type: "all",
    token: localStorage.getItem("token") || ""
  }
  this.service.spinnerMessage.next("Obteniendo todos los productos...");
  this.service.spinner.next(true);

  try {
    const response = await this.service.getAllProducts(data).toPromise();
    if(response && response.products){
      this.products = response.products;
      this.filteredProducts = response.products;
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

/**
 * Filter the products by packaging and client type
 */
filterProduct() {
  let avaliableProducts: Products[] = []
  if(this.packagingType !== ""){
    const filteredProducts = this.products.filter(product => product.packaging === this.packagingType);
    avaliableProducts = Array.from(filteredProducts);
  }
  if(this.clientType !== ""){
    if(avaliableProducts.length > 0){
      const filteredProducts = avaliableProducts.filter(product => product.type === this.clientType);
      avaliableProducts = Array.from(filteredProducts);
    } else{
      const filteredProducts = this.products.filter(product => product.type === this.clientType);
      avaliableProducts = Array.from(filteredProducts);
    }
  }

  if(avaliableProducts.length > 0) this.filteredProducts = avaliableProducts;
}

/**
 * Reset all filters and get all products again
 */
resetFilters(){
  for(let product of this.products){
    if(!this.filteredProducts.includes(product)) this.filteredProducts.push(product);
  }

  this.packagingType = "";
  this.clientType = "";
}

/**
 * This method check the price of the product and then update it in database
 * 
 * @param confirm - boolean - Check if the action of change the price is confirm or not
 */
async changePrice(confirm: boolean){
  this.showPopUp = false;
  this.finalPrice = Math.round(this.finalPrice * 100) / 100;
  if(this.finalPrice <= 0 && confirm){
    this.mostrarMensaje("El precio del producto debe ser mayor que 0.", false);
  } else if(confirm){
    const data = {
      product: this.selectProduct,
      price: this.finalPrice,
      token: localStorage.getItem("token") || ""
    }
    this.service.spinnerMessage.next("Modificando el precio del producto...");
    this.service.spinner.next(true);
  
    try {
      const response = await this.service.changeProductPrice(data).toPromise();
      this.mostrarMensaje("Se ha modificado el precio del producto correctamente.", true);
      this.selectProduct.price = this.finalPrice;
      this.finalPrice = 0;
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
