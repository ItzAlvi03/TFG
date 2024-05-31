import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from './Services/api.service';

@Injectable({
  providedIn: 'root'
})
export class InitGuard implements CanActivate {

  constructor(private service: ApiService, private router: Router) {}

  canActivate(): boolean {
    if (!!localStorage.getItem('token')) {
      this.router.navigate(['/home']);
      return false;
    } else {
      return true;
    }
  }
}
