import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * API_URL - String - URL of the API that we are going to use
   */
  private API_URL: String = "https://dulcestrinidad.pythonanywhere.com";
  /**
   * token - string - This variable will contain the token to access to the API
   */
  public token = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}
  /**
   * @param user 
   * @returns the token if success or a message of the error
   */
  userLogin(user: any): Observable<any>{
    return this.http.post(this.API_URL + '/userLogin', user);
  }
  /**
   * @returns username and rol of the user or a message of the error
   */
  auth(): Observable<any>{
    const token = {token: this.token.value}
    return this.http.post(this.API_URL + '/auth', token);
  }
}
