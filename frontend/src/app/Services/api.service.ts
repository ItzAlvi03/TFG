import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * spinner - boolean - To show or not the spinner
   */
  public spinner = new BehaviorSubject<boolean>(false);
  /**
   * spinner - string - Message on the spinner
   */
  public spinnerMessage = new BehaviorSubject<string>("");
  /**
   * correct - boolean - Determinate if the pop up is an error or succesfull message
   */
  public correct = new BehaviorSubject<boolean>(false);
  /**
   * alert - boolean - Activates or deactivate the pop up message
   */
  public alert = new BehaviorSubject<boolean>(false);
  /**
   * message - string - This is the message of the pop up
   */
  public message = new BehaviorSubject<string>("");
  /**
   * API_URL - String - URL of the API that we are going to use
   */
  private API_URL: String = "http://127.0.0.1:5555";
  /**
   * rol - string - This variable contains de user rol on the API
   */
  public rol = new BehaviorSubject<string>('');
  /**
   * username - string - This variable contains de username of the user
   */
  public username = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}
  /**
   * @param user 
   * @returns the token if success or a message of the error
   */
  userLogin(user: any): Observable<any>{
    return this.http.post(this.API_URL + '/userLogin', user);
  }

  /**
   * @param user 
   * @returns success or a message with the error
   */
  createAccount(user: any): Observable<any>{
    return this.http.post(this.API_URL + '/createAccount', user);
  }
  
  /**
   * @param client
   * @returns success or error
   */
  insertClient(client: any): Observable<any>{
    return this.http.post(this.API_URL + '/insertClient', client);
  }

  /**
   * @param name
   * @returns clients or empty
   */
  searchAllClients(name: any): Observable<any>{
    return this.http.post(this.API_URL + '/searchAllClients', name);
  }
  
  /**
   * 
   * @param product 
   * @returns all procucts on DB
   */
  getAllProducts(product: any): Observable<any> {
    return this.http.post(this.API_URL + '/getAllProducts', product);
  }

  /**
   * 
   * @param order 
   * @returns succesfully or error
   */
  insertOrder(order: any): Observable<any> {
    return this.http.post(this.API_URL + '/insertOrder', order);
  }

  /**
   * @param client
   * @returns invoices or none
   */
  searchClientInvoices(client: any): Observable<any> {
    return this.http.post(this.API_URL + "/searchClientInvoices", client);
  }

  /**
   * @param invoice
   * @returns successfully or none
   */
  changeInvoiceType(invoice: any): Observable<any> {
    return this.http.post(this.API_URL + "/changeInvoiceType", invoice);
  }

  /**
   * @returns username and rol of the user or a message of the error
   */
  auth(): Observable<any>{
    const token = {token: localStorage.getItem("token") || ""}
    return this.http.post(this.API_URL + '/auth', token);
  }
}
