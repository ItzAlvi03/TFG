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
   * @returns username and rol of the user or a message of the error
   */
  auth(): Observable<any>{
    const token = {token: localStorage.getItem("token") || ""}
    return this.http.post(this.API_URL + '/auth', token);
  }
}
