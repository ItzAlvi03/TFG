import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from './Services/api.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private service: ApiService, private router: Router) {}

  canActivate(): boolean {
    if (!!localStorage.getItem('token')) {
      let correct = this.decodeToken(localStorage.getItem('token') as string);
      if(correct){
        return true;
      } else{
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  /**
   * 
   * @param token 
   * @returns false si el token está expirado o true
   */
  decodeToken(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      let isExpired = decoded.exp ? decoded.exp < currentTime : true;
      if(isExpired){
        this.service.rol.next('');
        this.service.username.next('');
        return false;
      } else{
        this.service.rol.next(decoded.rol);
        this.service.username.next(decoded.username);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

}
