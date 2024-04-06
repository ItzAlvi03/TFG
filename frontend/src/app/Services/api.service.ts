import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_URL: String = "https://dulcestrinidad.pythonanywhere.com";

  constructor(private http: HttpClient) {}

  userLogin(user: any): Observable<any>{
    return this.http.post(this.API_URL + '/userLogin', user);
  }
}
