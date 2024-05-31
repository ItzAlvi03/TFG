import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-pagina-inicio',
  templateUrl: './pagina-inicio.component.html',
  styleUrls: ['./pagina-inicio.component.css']
})
export class PaginaInicioComponent implements OnInit{
  /**
   * username - string - Contains the user name's
   */
  username: string = "";
  /**
   * rol - string - Contains the user's rol
   */
  rol: string = "";
  /**
   * dentroSeccion - boolean - To check if the user is in other section
   */
  dentroSeccion: boolean = false;
  /**
   * opcion - number - The specific section where the user is located
   */
  opcion!: number;
  
  /**
   * 
   * @param service - ApiService - Angular Service to use the API.
   * @param router - Router - Angular Class that allows the user to move through the different components.
   */
  constructor(private service: ApiService, private router: Router) {}

  /**
   * Method that executes before the view is loaded.
   * Set the info of the user
   */
  ngOnInit(): void {
    this.username = this.service.username.value;
    this.rol = this.service.rol.value;
  }

  /**
   * Changes the differents sections
   * 
   * @param num - number - Number of the section to move
   */
  cambiarOpcion(num: number) {
    const seccion = document.getElementById('opcion' + num) as any;
    if(seccion){
      this.dentroSeccion = true;
      this.opcion = num;
    }
  }
  
  /**
   * Method to leave the home page and return to login
   */
  clearToken() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

}
